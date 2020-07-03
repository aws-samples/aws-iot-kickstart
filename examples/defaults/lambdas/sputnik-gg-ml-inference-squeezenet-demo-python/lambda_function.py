# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from camera import Camera
import sys
import getopt
import os
import time
from threading import Event, Thread, Timer
import math
import logging
import numpy as np  # pylint: disable=import-error

#############################################
# Helpers
#############################################

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

def get_input_topic(context):
    try:
        topic = context.client_context.custom['subject']
    except Exception as e:
        logging.error('Topic could not be parsed. ' + repr(e))
    return topic

def timeInMillis(): return int(round(time.time() * 1000))

def lambda_handler(event, context):
    input_topic = get_input_topic(context)
    return

def parseResolution(strResolution):
    resolution = strResolution.split('x')
    resolution[0] = int(resolution[0])
    resolution[1] = int(resolution[1])
    return (resolution[0], resolution[1])

#############################################
# Params
#############################################

THING_NAME = get_parameter('AWS_IOT_THING_NAME', 'Unknown')
CAMERA_TYPE = get_parameter("CAMERA_TYPE", "video0")
PREFIX = 'sputnik'
TOPIC_CAMERA = '{0}/{1}/camera'.format(PREFIX, THING_NAME)
ML_MODEL_PATH = get_parameter('ML_MODEL_PATH', '')
RESOLUTION = "224x224"

DUMMY_MODE = False
try:
    opts, args = getopt.getopt(sys.argv[1:], "hdc:m:")

    for opt, arg in opts:
        if opt == '-h':
            print("For debugging purposes, you can run this on your laptop with following arguments:")
            print(" -d                   - Dummy Mode")
            print(" -c  <Camera Type>    - Type of camera <video0/awscam/Darwin>")
            print(" -ml <ML Model Path>  - Destination of model on disk")
            sys.exit()
        if opt in ("-d"):
            DUMMY_MODE = True
            logging.warning("Dummy Mode = True")
        if opt in ("-c"):
            CAMERA_TYPE = arg
            logging.warning("Camera Mode = {}".format(CAMERA_TYPE))
        if opt in ("-m"):
            ML_MODEL_PATH = arg
            logging.warning("Model = {}".format(ML_MODEL_PATH))

except getopt.GetoptError:
    print("For debugging purposes, you can run this on your laptop with following arguments:")
    print(" -d                   - Dummy Mode")
    print(" -c  <Camera Type>    - Type of camera <video0/awscam/Darwin>")
    print(" -ml <ML Model Path>  - Destination of model on disk")
    # sys.exit(2)


#############################################
# Init
#############################################

try:
    #############################################
    # Greengrass SDK
    logging.warning("Start of lambda function")
    from ggiot import GGIoT
    ggIoT = GGIoT(thing=THING_NAME, prefix=PREFIX)

    resolution = parseResolution(RESOLUTION)

    #############################################
    # Camera
    logging.info("Setting up camera")
    myCamera = Camera(camera_type=CAMERA_TYPE, width=resolution[0], height=resolution[1])
    logging.info("CAMERA: Starting the camera with 2 reads...")
    logging.info("CAMERA.read(): {}".format(myCamera.read()[0]))
    logging.info("CAMERA.read(): {}".format(myCamera.read()[0]))
    myCamera.start()

    #############################################
    # OpenCV
    import cv2  # pylint: disable=import-error
    logging.info("OpenCV: {}".format(cv2.__version__))

    #############################################
    # VideoFileOutput
    from file_output import FileOutput
    logging.info("Initilizing ouput file")
    frame = 255*np.ones([resolution[0], resolution[1], 3])
    _, jpeg = cv2.imencode('.jpg', frame)
    resultMJPEG = FileOutput('/tmp/results.mjpeg', jpeg)
    resultMJPEG.start()
    resultMJPEG.write(jpeg)

    #############################################
    # Model
    logging.info("Loading model at: {}".format(ML_MODEL_PATH))
    from load_model import ImagenetModel
    myModel = ImagenetModel(
        synset_path=ML_MODEL_PATH + 'synset.txt',
        network_prefix=ML_MODEL_PATH + 'squeezenet_v1.1'
    )

except Exception as err:
    logging.exception("Init Exception: {}".format(err))
    ggIoT.exception(str(err))
    time.sleep(1)

last_update = timeInMillis()
nbFramesProcessed = 0
fps = 0

def camera_handler():

    global myCamera
    global myModel
    global ggIoT
    global last_update
    global fps
    global nbFramesProcessed

    ret, frame = myCamera.read()
    logging.info("Frame read: {}".format(ret))
    if ret == False:
        logging.error('Something is wrong, cant read frame')
        time.sleep(5)
        return

    logging.info("Frame resize...")
    frame = cv2.resize(frame, parseResolution(RESOLUTION))
    font = cv2.FONT_HERSHEY_SIMPLEX

    logging.info("Frame resized")
    inference_size_x = parseResolution(RESOLUTION)[0] / 2
    inference_size_y = parseResolution(RESOLUTION)[1] / 2

    ggIoT.info('Frame loaded: {}, {}'.format(frame.size, frame.shape))

    if myModel is not None:
        payload = []

        try:
            predictions = myModel.predict_from_image(
                cvimage=frame,
                reshape=(inference_size_x, inference_size_y),
                N=15
            )
            logging.info("Predictions: {}".format(predictions))

            for item in predictions:
                p, n = item
                prediction = {
                    "probability": "{}".format(p),
                    "name": n
                }
                payload.append(prediction)

            nbFramesProcessed += 1

            timeBetweenFrames = timeInMillis() - last_update
            if timeBetweenFrames > 1000:
                fps = math.floor(100 * (fps + (1000 * nbFramesProcessed / timeBetweenFrames)) / 2) / 100
                nbFramesProcessed = 0
                last_update = timeInMillis()

            ggIoT.publish(TOPIC_CAMERA, {
                "fps": str(fps),
                "frame": {
                    "size": frame.size,
                    "shape": frame.shape
                },
                "predictions": payload
            })

        except Exception as err:
            ggIoT.exception(str(err))
            logging.error("Exception: {}".format(str(err)))
            e = sys.exc_info()[0]
            logging.error("Exception occured during prediction: %s" % e)
            logging.error(sys.exc_info())

    cv2.putText(frame, 'FPS: {}'.format(str(fps)), (5, parseResolution(RESOLUTION)[1] - 5), font, 0.4, (0, 0, 255), 1)

    _, jpeg = cv2.imencode('.jpg', frame)
    resultMJPEG.write(jpeg)

    return


class MainAppThread(Thread):

    def __init__(self):
        super(MainAppThread, self).__init__()
        self.stop_request = Event()
        logging.info("MainAppThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            while 42:
                camera_handler()

        except Exception as err:
            logging.error("MainAppThread.run: Exception: {}".format(str(err)))
            ggIoT.exception(str(err))
            time.sleep(1)


mainAppThread = MainAppThread()
mainAppThread.start()
