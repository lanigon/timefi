# Python backend

Based on:

+ `FastAPI`: for backend serving
+ `OpenAI`: for general LLM usage, almost every llm supplier has their own OpenAI API service. So we adopt this general setup.
+ Etherscan API: for getting the latest block number and transaction status. (Through simple API calls, requests)
+ `Web3.py`: for wei conversion and interacting with the blockchain.
+ `swarm`: lightweight AI agent creater & framework, created by OpenAI.
+ `dstack-sdk`: the python sdk for dstack - the Phala Network's TEE RA generator.

# Setup

## Run Python code in TEE(Trusted Execution Environment)

### 1. Create a `.env` file
The very first thing you need to do is to create a `.env` file in the `src_py` directory. Because the `api_server.py` will first read the environment variables from the `.env` file.

The content of the `.env` file should be:
+ `OPENAI_API_KEY`: your OpenAI API key
+ `OPENAI_MODEL_NAME`: the name of the model you want to use
+ `OPENAI_BASE_URL`: the base URL of the OpenAI API service
+ `ETHERSCAN_API_KEY`: your Etherscan API key, used to get the transaction status of target wallet address.

For example, if we want to use GLM-4-Flash LLM, we should set the `.env` file as:

```bash
OPENAI_API_KEY="your_api_key_here"
OPENAI_MODEL_NAME="glm-4-flash"
OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"     # remember to change this to your own OpenAI API service URL.
ETHERSCAN_API_KEY="your_api_key_here"
```

### 2. Build Docker Image

Our code are running in the TEE, so we cannot normally run it directly on the host machine. We need to build a Docker image and run it in the TEE.

Use the following command to build the Docker image:

```bash
cd src_py           # NOTICE: you MUST cd to this python src directory, or the Dockerfile will not work.
docker build -t your-dapp:latest .
```


### 3. Launch *2* Docker Containers simultaneously

The **first** container is the TEE simulator, which is offered by Phala Network:

```bash
docker run --rm -p 8090:8090 phalanetwork/tappd-simulator:latest
```

And then, **open another terminal** and run the Docker image you just built, as the AI service:

```bash
docker run --rm -p 3000:3000 your-dapp:latest
```

# How to evaluate the wallet credit and base_number?

We have designed a pipeline for this:

![cn-pipe](docs/AI-eval-pipe-cn.png)

For english version, we have:

![en-pipe](docs/AI-eval-pipe-en.png)