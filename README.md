# Prometheus and Grafana: Visualizing Application Performance
This is the repository for the LinkedIn Learning course `Prometheus and Grafana: Visualizing Application Performance`. The full course is available from [LinkedIn Learning][lil-course-url].

![lil-thumbnail-url]

## Course Description

Whether you are already familiar with Grafana or a beginner, Systems Reliability Engineer (SRE) Opeyemi Onikute guides you through what you need to use Prometheus and Grafana to monitor and analyze applications in the real-world. Learn about Prometheus as a data source and explore all the tools you need to succeed with Grafana as a whole, including other data sources in the future. Beyond Grafana, find out how to create world-class dashboards as a whole.

## Instructions
This repository has branches for each of the videos in the course. You can use the branch pop up menu in github to switch to a specific branch and take a look at the course at that stage, or you can add `/tree/BRANCH_NAME` to the URL to go to the branch you want to access.

## Branches
The branches are structured to correspond to the videos in the course. The naming convention is `CHAPTER#_MOVIE#`. As an example, the branch named `02_03` corresponds to the second chapter and the third video in that chapter. 
Some branches will have a beginning and an end state. These are marked with the letters `b` for "beginning" and `e` for "end". The `b` branch contains the code as it is at the beginning of the movie. The `e` branch contains the code as it is at the end of the movie. The `main` branch holds the final state of the code when in the course.

When switching from one exercise files branch to the next after making changes to the files, you may get a message like this:

    error: Your local changes to the following files would be overwritten by checkout:        [files]
    Please commit your changes or stash them before you switch branches.
    Aborting

To resolve this issue:
	
    Add changes to git using this command: git add .
	Commit changes using this command: git commit -m "some message"

## Installing
1. To use these exercise files, you must have the following installed:
	- [Docker](https://docs.docker.com/engine/install/)
    - [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
    - [NodeJS (+ npm)](https://nodejs.org/en/download)
    - [Python](https://www.python.org/downloads/)

2. Clone this repository into your local machine using the terminal (Mac), CMD (Windows), or a GUI tool like SourceTree.

## Running the examples
Each demo environment used in this course has a folder. The advanced examples have READMEs that describe how to get up and running. It's best to follow along with the course videos as well. The expected examples are as follows:

1. **Simple Docker playground**: This is found in the `docker` folder. To run the Docker Compose environment, use the following commands:
    ```
    cd docker
    docker-compose up -d && docker-compose logs -f
    ```

2. **Basic Plugin Example**: This is an example of a simple plugin generated using the Grafana plugin scaffold. It is used in Chapter 3. Setup instructions can be found in [/plugin-example/test-test-datasource/README.md](plugin-example/test-test-datasource/README.md).

3. **Ecommerce Application**: This is an order management application that is used extensively from Chapter 5 to teach you how to build world-class dashboards from scratch. Setup instructions can be found in [/ecommerce-application/README.md](ecommerce-application/README.md)

4. **LLM Plugin**: This is a plugin environment that showcases how to build an LLM integration with Grafana Open Source, to bring the magic of Artificial Intelligence to your daily use. Setup instructions can be found in [/llm-plugin-demo/README.md](llm-plugin-demo/README.md).

## Instructor

Opeyemi Onikute

Site Reliability Engineer with years of experience using Prometheus and Grafana to build observability into complex systems. My aim is to help every student become world-class in reliabilty, observability and performance.
                            

Check out my other courses on [LinkedIn Learning](https://www.linkedin.com/learning/instructors/opeyemi-onikute).


[0]: # (Replace these placeholder URLs with actual course URLs)

[lil-course-url]: https://www.linkedin.com/learning/prometheus-and-grafana-visualizing-application-performance
[lil-thumbnail-url]: https://media.licdn.com/dms/image/v2/D4E0DAQFYXny3o50sqQ/learning-public-crop_675_1200/B4EZh2I95VHoAY-/0/1754328719800?e=2147483647&v=beta&t=MZd77C_JdmgLZqdQHjiDrEOkqFTATZsV2AT2-N0pN1A

