// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MLModelMarketplace
 * @dev Smart contract for managing ML model marketplace with zk-proof verification
 */
contract MLModelMarketplace {
    // Structs
    struct Model {
        address provider;
        string name;
        string description;
        string inputFormat;
        uint256 pricePerPrediction;
        bytes32 codeHash;  // Hash of the model's executable code
        bool isActive;
    }

    struct PredictionRequest {
        address user;
        uint256 modelId;
        uint256[] inputs;
        uint256 timestamp;
        bool isProcessed;
        uint256 result;
        bytes32 proofSummary;
    }

    // State variables
    uint256 private nextModelId;
    uint256 private nextRequestId;
    mapping(uint256 => Model) public models;
    mapping(uint256 => PredictionRequest) public predictions;
    mapping(address => uint256[]) public providerModels;
    mapping(address => uint256[]) public userPredictions;

    // Events
    event ModelRegistered(uint256 indexed modelId, address indexed provider, string name);
    event ModelUpdated(uint256 indexed modelId, uint256 newPrice);
    event ModelDeactivated(uint256 indexed modelId);
    event PredictionRequested(uint256 indexed requestId, uint256 indexed modelId, address indexed user);
    event PredictionFulfilled(uint256 indexed requestId, uint256 result, bytes32 proofSummary);

    // Modifiers
    modifier onlyModelProvider(uint256 modelId) {
        require(models[modelId].provider == msg.sender, "Not the model provider");
        _;
    }

    modifier modelExists(uint256 modelId) {
        require(models[modelId].isActive, "Model does not exist or is inactive");
        _;
    }

    // Constructor
    constructor() {
        nextModelId = 1;
        nextRequestId = 1;
    }

    /**
     * @dev Register a new ML model
     * @param name Model name
     * @param description Model description
     * @param inputFormat Required input format description
     * @param pricePerPrediction Price in wei per prediction
     * @param codeHash Hash of the model's executable code
     */
    function registerModel(
        string memory name,
        string memory description,
        string memory inputFormat,
        uint256 pricePerPrediction,
        bytes32 codeHash
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(codeHash != bytes32(0), "Code hash cannot be empty");

        uint256 modelId = nextModelId++;
        
        models[modelId] = Model({
            provider: msg.sender,
            name: name,
            description: description,
            inputFormat: inputFormat,
            pricePerPrediction: pricePerPrediction,
            codeHash: codeHash,
            isActive: true
        });

        providerModels[msg.sender].push(modelId);
        
        emit ModelRegistered(modelId, msg.sender, name);
        return modelId;
    }

    /**
    // request proofs from risc0 VM
     * @dev Request a prediction from a model
     * @param modelId ID of the model to use
     * @param inputs Array of input values (scaled integers)
     */
    function requestPrediction(uint256 modelId, uint256[] calldata inputs) 
        external 
        payable
        modelExists(modelId)
        returns (uint256)
    {
        Model storage model = models[modelId];
        require(msg.value >= model.pricePerPrediction, "Insufficient payment");
        
        uint256 requestId = nextRequestId++;
        predictions[requestId] = PredictionRequest({
            user: msg.sender,
            modelId: modelId,
            inputs: inputs,
            timestamp: block.timestamp,
            isProcessed: false,
            result: 0,
            proofSummary: bytes32(0)
        });

        userPredictions[msg.sender].push(requestId);
        
        emit PredictionRequested(requestId, modelId, msg.sender);
        return requestId;
    }

    /**
     * @dev Submit prediction result with zk-proof verification
     * @param requestId ID of the prediction request
     * @param result The prediction result
     * @param proofSummary Summary hash of the zk-proof
     */
    function submitPredictionResult(
        uint256 requestId,
        uint256 result,
        bytes32 proofSummary
    ) 
        external 
        onlyModelProvider(predictions[requestId].modelId)
    {
        PredictionRequest storage request = predictions[requestId];
        require(!request.isProcessed, "Prediction already processed");
        require(proofSummary != bytes32(0), "Invalid proof summary");

        request.isProcessed = true;
        request.result = result;
        request.proofSummary = proofSummary;

        // Transfer payment to model provider
        Model storage model = models[request.modelId];
        payable(model.provider).transfer(model.pricePerPrediction);

        emit PredictionFulfilled(requestId, result, proofSummary);
    }

    /**
     * @dev Update model price
     * @param modelId ID of the model
     * @param newPrice New price per prediction
     */
    function updateModelPrice(uint256 modelId, uint256 newPrice) 
        external 
        onlyModelProvider(modelId)
        modelExists(modelId)
    {
        models[modelId].pricePerPrediction = newPrice;
        emit ModelUpdated(modelId, newPrice);
    }

    /**
     * @dev Deactivate a model
     * @param modelId ID of the model to deactivate
     */
    function deactivateModel(uint256 modelId) 
        external 
        onlyModelProvider(modelId)
        modelExists(modelId)
    {
        models[modelId].isActive = false;
        emit ModelDeactivated(modelId);
    }

    // View functions
    function getModelDetails(uint256 modelId) 
        external 
        view 
        returns (
            address provider,
            string memory name,
            string memory description,
            string memory inputFormat,
            uint256 pricePerPrediction,
            bytes32 codeHash,
            bool isActive
        )
    {
        Model storage model = models[modelId];
        return (
            model.provider,
            model.name,
            model.description,
            model.inputFormat,
            model.pricePerPrediction,
            model.codeHash,
            model.isActive
        );
    }

    function getPredictionDetails(uint256 requestId)
        external
        view
        returns (
            address user,
            uint256 modelId,
            uint256[] memory inputs,
            uint256 timestamp,
            bool isProcessed,
            uint256 result,
            bytes32 proofSummary
        )
    {
        PredictionRequest storage request = predictions[requestId];
        return (
            request.user,
            request.modelId,
            request.inputs,
            request.timestamp,
            request.isProcessed,
            request.result,
            request.proofSummary
        );
    }

    function getProviderModels(address provider) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return providerModels[provider];
    }

    function getUserPredictions(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPredictions[user];
    }
}