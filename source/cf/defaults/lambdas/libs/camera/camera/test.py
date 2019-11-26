# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
from camera import Camera

logging.info('Start of the test code.')

CAMERA = Camera(camera_type="Darwin")

print(CAMERA.read())
