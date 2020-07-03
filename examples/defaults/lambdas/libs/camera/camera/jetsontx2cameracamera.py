# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import cv2

class JetsonTX2Camera:

    def __init__(self):
        logging.info("Initializing the Jetson TX2 camera")
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

    def read(self):
        return self.stream.read()
