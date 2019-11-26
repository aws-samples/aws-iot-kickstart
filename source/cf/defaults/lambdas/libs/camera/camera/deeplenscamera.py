# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import awscam  # pylint: disable=import-error
import logging

class DeeplensCamera:

    def __init__(self):
        logging.info("Initializing the Deeplens Camera: awscam")

    def read(self):
        return awscam.getLastFrame()
