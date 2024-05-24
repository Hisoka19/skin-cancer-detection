const predictClassification = require('../services/inferenceService');
const { v4: uuidv4 } = require('uuid');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { label, explanation, suggestion } = await predictClassification(model, image);
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  const data = {
    id: id,
    result: label,
    explanation: explanation,
    suggestion: suggestion,
    createdAt: createdAt
  };

  try {
    const documentRef = firestore.collection('predictions').doc(id);
    await documentRef.set(data);
  } catch (error) {
    console.error('Error writing document:', error);
    return h.response({
      status: 'error',
      message: 'Failed to store prediction data in Firestore'
    }).code(500);
  }

  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully.',
    data
  });
  response.code(201);
  return response;
}

module.exports = postPredictHandler;
