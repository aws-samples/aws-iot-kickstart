'''
Module camera provides the VideoStream class which
offers a threaded interface to multiple types of cameras.
'''
from threading import Thread
import io
import os
import platform
import numpy as np  # pylint: disable=import-error

class VideoStream:
    '''
    Instantiate the VideoStream class.
    Use the method read() to get the frame.
    '''
    def __init__(self, camera_type="video0", path_to_camera="/dev/video0", width="1920", height="1080"):
        ''' Constructor. Chooses a camera to read from. '''
        print("VideoStream: {}, {}, {}, {}".format(camera_type, path_to_camera, width, height))
        self.camera_type = camera_type
        self.path_to_camera = path_to_camera
        self.width = width
        self.height = height

        if self.camera_type == "Darwin":

            print("VideoStream: Opening webcam")
            self.path_to_camera = "Webcam"
            import cv2  # pylint: disable=import-error
            self.stream = cv2.VideoCapture(0)
            self.stream.set(3, self.width)
            self.stream.set(4, self.height)

        elif self.camera_type == "video0":

            print("VideoStream: Opening {}".format(self.path_to_camera))
            import cv2  # pylint: disable=import-error
            self.stream = cv2.VideoCapture(self.path_to_camera)
            print("VideoStream: Stream opened = {}".format(self.stream.isOpened()))

        elif self.camera_type == "awscam":

            print("VideoStream: Opening awscam")
            import awscam  # pylint: disable=import-error
            self.stream = awscam
            self.stream.read = self.stream.getLastFrame
            print("VideoStream: awscam opened")

        elif self.camera_type == "picamera":

            print("VideoStream: Opening picamera")
            import picamera  # pylint: disable=import-error

            def piCameraCapture(self):
                _stream = io.BytesIO()
                # time.sleep(2)
                PICAMERA.capture(_stream, format='jpeg')
                # Construct a numpy array from the _stream
                data = np.fromstring(_stream.getvalue(), dtype=np.uint8)
                # "Decode" the image from the array, preserving colour
                return True, cv2.imdecode(data, 1)

            picamera.PiCamera.read = piCameraCapture
            PICAMERA = self.stream = picamera.PiCamera()
            self.stream.resolution = (self.width, self.height)
            self.stream.start_preview()
            print("VideoStream: picamera opened")

        else:
            self.path_to_camera = "GStreamer"
            HD_2K = False
            if HD_2K:
                self.width = 2592  # 648
                self.height = 1944  # 486
            else:
                self.width = 1296  # 324
                self.height = 972  # 243

            gst_str = ("nvcamerasrc ! "
                       "video/x-raw(memory:NVMM), width=(int)2592, height=(int)1944,"
                       "format=(string)I420, framerate=(fraction)30/1 ! "
                       "nvvidconv ! video/x-raw, width=(int){}, height=(int){}, "
                       "format=(string)BGRx ! videoconvert ! appsink").format(self.width, self.height)
            self.stream = cv2.VideoCapture(gst_str, cv2.CAP_GSTREAMER)

        self.stopped = False
        self.ret, self.frame = self.stream.read()
        print("Videostream init done.")

    def get_height(self):
        return self.height

    def get_width(self):
        return self.width

    def get_white_frame(self):
        return 255*np.ones([self.width, self.height, 3])

    def start(self):
        '''start() starts the thread'''
        thread = Thread(target=self.update, args=())
        thread.daemon = True
        thread.start()
        return self

    def update(self):
        '''update() constantly read the camera stream'''
        print("VideoStream: udpate: starting the camera reads")
        while not self.stopped:
            self.ret, self.frame = self.stream.read()

    def read(self):
        '''read() return the last frame captured'''
        return self.ret, self.frame

    # def read(self):
    #     '''read() return the last frame captured'''
    #     return self.stream.read()

    def stop(self):
        '''stop() set a flag to stop the update loop'''
        self.stopped = True
