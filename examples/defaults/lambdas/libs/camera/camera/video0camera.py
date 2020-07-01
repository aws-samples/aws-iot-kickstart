# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import cv2

class Video0Camera:

    def __init__(self, width=1920, height=1080):
        logging.info("Initializing the video0 Camera")
        self.stream = cv2.VideoCapture(0)
        self.stream.set(3, width)
        self.stream.set(4, height)

    def read(self):
        return self.stream.read()
