# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

'''
Module camera provides the Camera class which
offers a threaded interface to multiple types of cameras.
'''
import logging
from threading import Thread

class Camera:
    '''
    Instantiate the Camera class.
    Use the method read() to get the frame.
    '''

    def __init__(self, camera_type="video0", width=1920, height=1080):
        ''' Constructor. Chooses a camera to read from. '''
        logging.info("Camera: {}, {}, {}".format(camera_type, width, height))

        self.camera_type = camera_type
        self.width = width
        self.height = height

        # Exclude awscam first.
        if self.camera_type == "Darwin":
            from .darwincamera import DarwinCamera
            self.camera = DarwinCamera(width=self.width, height=self.height)

        elif self.camera_type == "video0":
            from .video0camera import Video0Camera
            self.camera = Video0Camera()

        elif self.camera_type == "picamera":
            from .raspberrypicamera import RaspberryPiCamera
            self.camera = RaspberryPiCamera()

        elif self.camera_type == "awscam":
            from .deeplenscamera import DeeplensCamera
            self.camera = DeeplensCamera()

        elif self.camera_type == "jetsontx2":
            from .jetsontx2camera import JetsonTX2Camera
            self.camera = JetsonTX2Camera()

        self.stopped = False
        self.ret, self.frame = self.camera.read()
        logging.info("Camera init done.")
        self.start()

    def get_height(self):
        return self.height

    def get_width(self):
        return self.width

    def start(self):
        '''start() starts the thread'''
        thread = Thread(target=self.update, args=())
        thread.daemon = True
        thread.start()
        return self

    def update(self):
        '''update() constantly read the camera stream'''
        logging.info("Camera: udpate: starting the camera reads")
        while not self.stopped:
            try:
                self.ret, self.frame = self.camera.read()
            except Exception as err:
                logging.error("Camera.update: Exception: {}".format(str(err)))

    def read(self):
        '''read() return the last frame captured'''
        return self.ret, self.frame

    def stop(self):
        '''stop() set a flag to stop the update loop'''
        self.stopped = True
