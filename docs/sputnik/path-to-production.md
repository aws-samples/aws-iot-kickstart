# Sputnik Path to Production

> ***DISCLAIMER:*** This project is **NOT** production ready and is an example provided "AS IS" based on the [Amazon Software License](https://aws.amazon.com/asl/).
> It is the sole responsibility of any entity using this software to perform the diligence required before using any part of this project.

> ***DISCLAIMER:*** This list is not complete and does not depict in anyway that the project is "production ready" if completed.
> This is a *partial* example of steps that could be performed prepare this project to a production environment.

The Sputnik project is a great Kickstarter project, but it is not production ready.

Here is a *partial* list of steps that could be taken to get the project ready for production.

## Standard Best Practices

### [ ] Security
#### [ ] Security: AWS Resources (CDK)
Ensure proper security policies are in place for all AWS resources.

All AWS resources should have proper security policies in place to prevent malicious usage and/or exploitation. This includes but is not limited to:
* Fine grain IAM authorization (only allow the minimum permissions for each user/role that is required)
* Track activity in your AWS resources by using AWS CloudTrail
 
More information can be found here: https://aws.amazon.com/security/

Before using this project a complete security audit must be performed on the entire codebase.

#### [ ] Security: Website
The project's focus is on showing example of how to integrate a frontend website with backend IoT resources and therefore does not focus on general website
security outside of this context.

A complete audit of the example angular website must be performed to make sure that it meets security best practices based on final implementation of integrated solution.

The following resources can help in getting started with website security
* [How to Secure & Protect Your Website](https://sucuri.net/guides/website-security/)
* [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse)

### [ ] Error handling
Add exception Handling to every component of this architecture, including both infrastructure and web.

The project has implemented exception handling only where need to validate general usage of the solution.
As such a deeper analysis of the code base and infrastructure should be undertaken to ensure the resiliency and robustness of the solutions.

### [ ] Unit Testing
All **critical** code paths should have extensive code coverage as well as comprehensive coverage of all code.

### [ ] Integration Testing
All **critical** features should have integration testing.

### [ ] Logging
Currently the infrastructure is configured with general Cloudwatch logging, however, this needs to be revisited based on specific needs and complete solution being implemented.

Additional logging should be added within the application so in the event of failure, sufficient information is available via the logs.

For system critical operations, we recommend setting up SNS (Simple Notification Service) notifications to notify the right personnel when a system/application failure happens.

### [ ] Monitoring and Dashboards
A CloudWatch dashboard should be created to monitor all the AWS resources for the final solution in one place.

### [ ] Performance & Optimizations
This project has focused on showcasing the "art of the possible" and has not been fine-tuned for performance.

Once comprehensive **Logging** and **Monitoring** have been implemented, those can be used to drive insights into the performance of the components of this solution.
From those insights, targeted improvements can be might to optimize all aspects of the project tailed to specific use case.

### [ ] Continuous Integration and Continuous Delivery (CI/CD)
A CI/CD pipeline helps automate the steps in the software delivery process, such as initiating automatic builds and then deploying to the AWS Cloud.

CodePipeline, a service that builds, tests, and deploys your code every time there is a code change, can be used to orchestrate each step in the release process.

The prject was built with basic CI/CD setup for development, but does not include running tests, staged deployments, etc.

### [ ] Custom Domain Names
The project does not use custom domain names for the website and APIs

For production, the CloudFront distribution, API Gateway and AppSync resources must be fronted with custom domain name to ensure persistent endpoints.
