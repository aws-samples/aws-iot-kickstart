# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import picamera  # pylint: disable=import-error
import io
import cv2
import numpy as np

class RaspberryPiCamera:

    def __init__(self, width=1920, height=1080):
        logging.info("Initializing the picamera")

        def piCameraCapture(self):
            _stream = io.BytesIO()
            self.picam.capture(_stream, format='jpeg')
            # Construct a numpy array from the _stream
            data = np.fromstring(_stream.getvalue(), dtype=np.uint8)
            # "Decode" the image from the array, preserving colour
            return True, cv2.imdecode(data, 1)

        picamera.PiCamera.read = piCameraCapture
        PICAMERA = self.stream = picamera.PiCamera()
        self.stream.resolution = (self.width, self.height)
        self.stream.start_preview()

    def read(self):
        return self.stream.read()
