import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import Api from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

import attachPrincipalPolicy from '../graphql/mutations/attach-principal-policy';
import getThingShadow from '../graphql/queries/iotdata-thing-shadow.get';
import updateThingShadow from '../graphql/mutations/iotdata-thing-shadow.update';

declare var appVariables: any;

@Injectable()
export class IoTService {
    private iot;

    private connectionSubject: any = new Subject<boolean>();
    public connectionObservable$ = this.connectionSubject.asObservable();
    public isConnected = false;

    constructor() {}

    connect() {
        Auth.currentCredentials()
            .then(credentials => {
                const promise: any = Api.graphql({
                    query: attachPrincipalPolicy.loc.source.body,
                    variables: {
                        policyName: appVariables.IOT_COGNITO_POLICY,
                        principal: credentials.identityId
                    }
                });

                return promise.then(result => {
                    result = result.data.attachPrincipalPolicy;
                    if (result === true) {
                        Amplify.addPluggable(
                            new AWSIoTProvider({
                                aws_pubsub_region: appVariables.REGION,
                                aws_pubsub_endpoint: 'wss://' + appVariables.IOT_ENDPOINT + '/mqtt'
                            })
                        );
                    }
                    return result;
                });
            })
            .then(result => {
                console.log('Connected to AWS IoT', result);
                this.isConnected = true;
                this.connectionSubject.next(this.isConnected);
            })
            .catch(err => {
                console.error('Error while trying to connect to AWS IoT:', err);
                this.isConnected = false;
                this.connectionSubject.next(this.isConnected);
            });
    }

    subscribe(topic: string, onMessage, onError) {
        return PubSub.subscribe(topic, {}).subscribe(
            data => onMessage(data),
            error => onError(error),
            () => {
                console.log('Subscription to', topic, 'done.');
            }
        );
    }

    publish(topic: string, payload: any) {
        return PubSub.publish(topic, payload, {});
    }

    getThingShadow(params: any) {
        const promise: any = Api.graphql({
            query: getThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });
        return promise.then(result => JSON.parse(result.data.getThingShadow.payload));
    }

    updateThingShadow(params: any) {
        const promise: any = Api.graphql({
            query: updateThingShadow.loc.source.body,
            variables: {
                params: JSON.stringify(params)
            }
        });

        return promise.then(result => JSON.parse(result.data.updateThingShadow.payload));
    }
}
