# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0


import os
import sys
import time
import uuid
import json
import logging
import math
import datetime
from threading import Timer

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

import boto3
client = boto3.client('greengrass')

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

HOST = get_parameter("IOT_ENDPOINT", "UNKNOWN")
THING_NAME = get_parameter("THING_NAME", "UNKNOWN")
GATEWAY = get_parameter("GATEWAY", "UNKNOWN")
GATEWAY_GG_GROUP_ID = get_parameter("GATEWAY_GG_GROUP_ID", "UNKNOWN")

CLIENT_ID = THING_NAME
ROOT_CA_PATH = "/greengrass/certs/"
CERTIFICATE_PATH = "/greengrass/certs/"
PRIVATE_KEY_PATH = "/greengrass/certs/"

MAX_DISCOVERY_RETRIES = 10
GROUP_CA_PATH = "/tmp/"

with open('/greengrass/config/config.json', 'r') as config:
    config_dict = json.load(config)
    ROOT_CA_PATH += config_dict['coreThing']['caPath']
    CERTIFICATE_PATH += config_dict['coreThing']['certPath']
    PRIVATE_KEY_PATH += config_dict['coreThing']['keyPath']

print("Start of lambda")
print("Cert info:")
print("ROOT_CA_PATH:        {}".format(ROOT_CA_PATH))
print("CERTIFICATE_PATH:    {}".format(CERTIFICATE_PATH))
print("PRIVATE_KEY_PATH:    {}".format(PRIVATE_KEY_PATH))
print("Thing and Gateway info:")
print("THING_NAME:          {}".format(THING_NAME))
print("HOST:                {}".format(HOST))
print("GATEWAY_GG_GROUP_ID: {}".format(GATEWAY_GG_GROUP_ID))

groupCA = GROUP_CA_PATH + GATEWAY_GG_GROUP_ID + "_CA.crt"
connectivityInfoList = None


def onMessage(message):
    try:
        print('Received message on topic %s: %s\n' % (message.topic, message.payload))
    except Exception as e:
        print(e)

def onOffline():
    global connected
    print('Lost connection.')
    connected = False

# Iterate through all connection options for the core and use the first successful one
myAWSIoTMQTTClient = AWSIoTMQTTClient(CLIENT_ID)
myAWSIoTMQTTClient.onMessage = onMessage
myAWSIoTMQTTClient.onOffline = onOffline

connected = False

def greengrass_run():

    global groupCA
    global connectivityInfoList
    global connected

    #############################################
    ## DISCOVER
    #############################################
    if connected == True:
        message = {
            'message': "Hello from IoT Device!"
        }
        myAWSIoTMQTTClient.publish("hello/world", json.dumps(message), 0)
        print("Message published")

    else:
        print("Not connected. Lets get the GroupCA")

        try:
            groupCertificateAuthoritiesList = client.list_group_certificate_authorities(GroupId=GATEWAY_GG_GROUP_ID)

            if len(groupCertificateAuthoritiesList['GroupCertificateAuthorities']) >= 1:
                print("Found {} Certificate Authorities".format(len(groupCertificateAuthoritiesList['GroupCertificateAuthorities'])))

                groupCertificateAuthorityId = groupCertificateAuthoritiesList[
                    'GroupCertificateAuthorities'][0]['GroupCertificateAuthorityId']
                print("Found Certificate Authority Id: {}".format(groupCertificateAuthorityId))

                certificateAuthority = client.get_group_certificate_authority(
                    GroupId=GATEWAY_GG_GROUP_ID, CertificateAuthorityId=groupCertificateAuthorityId)
                ca = certificateAuthority['PemEncodedCertificate']
                print("CA: {}".format(ca))

                print("Persist the connectivity/identity information...")
                if not os.path.exists(GROUP_CA_PATH):
                    os.makedirs(GROUP_CA_PATH)
                groupCAFile = open(groupCA, "w")
                groupCAFile.write(ca)
                groupCAFile.close()

                print("GroupCA persisted, lets try to connect")
                connectivityInfoList = client.get_connectivity_info(ThingName=GATEWAY)

                myAWSIoTMQTTClient.configureCredentials(groupCA, PRIVATE_KEY_PATH, CERTIFICATE_PATH)

                for connectivityInfo in connectivityInfoList['ConnectivityInfo']:
                    currentHost = connectivityInfo['HostAddress']
                    currentPort = connectivityInfo['PortNumber']
                    print("Found %s:%d" % (currentHost, currentPort))

                for connectivityInfo in connectivityInfoList['ConnectivityInfo']:  # coreInfo.connectivityInfoList:
                    currentHost = connectivityInfo['HostAddress']
                    currentPort = connectivityInfo['PortNumber']

                    print("Trying to connect to core at %s:%d" % (currentHost, currentPort))
                    myAWSIoTMQTTClient.configureEndpoint(currentHost, currentPort)

                    try:
                        myAWSIoTMQTTClient.connect()
                        connected = True
                        print("Successfully connected with %s:%d" % (currentHost, currentPort))
                        break
                    except BaseException as e:
                        print("Error in connect!")
                        print("Type: %s" % str(type(e)))
                        print("Error message: %s" % e.message)

        except BaseException as e:
            print("Error in calling the APIs and getting the data!")
            print("Type: %s" % str(type(e)))
            print("Error message: %s" % e.message)

    # Asynchronously schedule this function to be run again in 5 seconds
    Timer(10, greengrass_run).start()


# Execute the function above
greengrass_run()

def lambda_handler(event, context):
    return
