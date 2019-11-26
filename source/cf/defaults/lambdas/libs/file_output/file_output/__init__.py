# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from threading import Thread
import os


class FileOutput(Thread):
    '''
    File output manage an opencv frame output
    saving it to disque in mjpeg format.
    '''

    def __init__(self, path, frame):
        ''' Constructor. '''
        Thread.__init__(self)

        self.stopped = False
        self.path = path
        self.write(frame)

    def stop(self):
        '''stop() set a flag to stop the run loop'''
        self.stopped = True

    def write(self, jpeg):
        '''write() refresh the last opencv frame'''
        self.jpeg = jpeg

    def run(self):
        '''run() constantly write the file on drive'''
        if not os.path.exists(self.path):
            os.mkfifo(self.path)
        file = open(self.path, 'w')
        while not self.stopped:
            try:
                file.write(self.jpeg.tobytes())
            except IOError as err:
                file = open(self.path, 'w')
                continue
