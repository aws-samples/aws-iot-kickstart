# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import json
from inspect import currentframe

class GGIoT:

    # Constructor
    def __init__(self, thing='default', prefix='sputnik', dummy=False):
        self.thing = thing
        self.prefix = prefix
        self.topicPrefix = self.prefix + '/' + self.thing + '/'
        self.topicLogger = self.topicPrefix + 'logger'

        if dummy == False:
            import greengrasssdk
            ggsdk = greengrasssdk.client('iot-data')

            def prepPublish(topic=self.topicLogger, payload={}):
                ggsdk.publish(topic=topic, payload=json.dumps(payload))

            def prepUpdateShadow(thing=self.thing, payload={}):
                ggsdk.update_thing_shadow(thingName=thing, payload=json.dumps(payload))

            def prepGetShadow(thingName=self.thing):
                response = ggsdk.get_thing_shadow(thingName=thingName)
                payloadDict = json.loads(response['payload'])
                return payloadDict

            self.publish = prepPublish
            self.updateThingShadow = prepUpdateShadow
            self.getThingShadow = prepGetShadow

        else:
            logging.warn("Setting up GGSDK in dummy mode")

            def debug(topic=self.topicLogger, payload={}):
                logging.debug(topic + ': ' + json.dumps(payload))

            def debugUpdateShadow(thing=self.thing, payload={}):
                logging.debug("ggsdk.updateThingShadow: " + thing + ": " + json.dumps(payload))

            def debugGetShadow(thing=self.thing, payload={}):
                logging.debug("ggsdk.getThingShadow: " + thing + ": {}")
                return {}

            self.publish = debug
            self.updateThingShadow = debugUpdateShadow
            self.getThingShadow = debugGetShadow

    def info(self, data):
        self.publish(topic=self.topicLogger, payload={
            "type":  "info",
            "payload": data
        })

    def exception(self, err):
        self.publish(topic=self.topicLogger, payload={
            "type":  "exception",
            "line": currentframe().f_back.f_lineno,
            "payload": err
        })

    def publish(self, topic, data):
        self.publish(topic=topic, payload=data)

    def updateThingShadow(self, data):
        self.updateThingShadow(thing=self.thing, payload=data)

    def getThingShadow(self):
        return self.getThingShadow()
