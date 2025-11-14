import pytest
import json
from unittest.mock import patch, MagicMock

# Before importing the app, set a test environment variable
# This prevents the real models from loading during tests
import os
os.environ['FLASK_ENV'] = 'testing'

from main import app

@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    with app.test_client() as client:
        yield client

# --- Mock Data ---
MOCK_AUTH_TOKEN = "test-secret-token"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {MOCK_AUTH_TOKEN}"
}

# --- Test Suite ---

@patch('main.embedding_model')
@patch('main.knowledge_collection')
@patch('requests.post')
def test_health_inquiry_flow(mock_requests_post, mock_collection, mock_embedding_model, client):
    """
    Tests the full RAG flow for a general health question.
    It verifies that the orchestrator correctly routes to the Health Inquiry Agent.
    """
    # --- Arrange ---
    # 1. Mock the intent classification call
    mock_requests_post.side_effect = [
        # First call: Intent Classification
        MagicMock(status_code=200, json=lambda: {"choices": [{"message": {"content": "health_inquiry"}}]}),
        # Second call: Final Answer Generation
        MagicMock(status_code=200, json=lambda: {"choices": [{"message": {"content": "Based on the context, fungal infections often present with itching and skin rashes."}}]})
    ]
    # 2. Mock the embedding and retrieval steps
    mock_embedding_model.encode.return_value.tolist.return_value = [0.1] * 384
    mock_collection.query.return_value = {
        'documents': [['Fungal infection symptoms include itching and skin rash.']],
        'metadatas': [[{'source': 'disease_data/Fungal_infection.txt'}]],
        'distances': [[0.1]]
    }

    # --- Act ---
    response = client.post('/v1/agent/orchestrate', headers=HEADERS, data=json.dumps({
        "query": "What are the symptoms of a fungal infection?"
    }))

    # --- Assert ---
    assert response.status_code == 200
    data = response.json
    assert data['agent'] == "Health Inquiry Agent"
    assert "itching and skin rashes" in data['answer']
    assert len(data['sources']) > 0
    assert data['sources'][0]['source'] == 'disease_data/Fungal_infection.txt'

@patch('requests.post')
def test_care_coordination_flow(mock_requests_post, client):
    """
    Tests the flow for a user asking to book an appointment.
    It verifies that the orchestrator routes to the Care Coordinator Agent.
    """
    # --- Arrange ---
    # Mock only the intent classification call
    mock_requests_post.return_value = MagicMock(
        status_code=200, 
        json=lambda: {"choices": [{"message": {"content": "care_coordination"}}]}
    )

    # --- Act ---
    response = client.post('/v1/agent/orchestrate', headers=HEADERS, data=json.dumps({
        "query": "I need to find a doctor."
    }))

    # --- Assert ---
    assert response.status_code == 200
    data = response.json
    assert data['agent'] == "Care Coordinator Agent"
    assert "find a doctor near you" in data['answer']
    assert len(data['sources']) == 0

@patch('requests.post')
def test_unclear_intent_flow(mock_requests_post, client):
    """
    Tests the fallback flow for an ambiguous or irrelevant query.
    """
    # --- Arrange ---
    mock_requests_post.return_value = MagicMock(
        status_code=200, 
        json=lambda: {"choices": [{"message": {"content": "unclear"}}]}
    )

    # --- Act ---
    response = client.post('/v1/agent/orchestrate', headers=HEADERS, data=json.dumps({
        "query": "What is the weather today?"
    }))

    # --- Assert ---
    assert response.status_code == 200
    data = response.json
    assert data['agent'] == "Orchestrator"
    assert "I'm not sure how to help with that" in data['answer']

@patch('main.embedding_model')
@patch('main.knowledge_collection')
@patch('requests.post')
def test_crisis_keyword_flow(mock_requests_post, mock_collection, mock_embedding_model, client):
    """
    Tests the immediate routing for crisis keywords, bypassing the LLM for intent.
    It should be routed directly to the RAG agent to find relevant help information.
    """
    # --- Arrange ---
    # NOTE: The intent classification call is SKIPPED due to the hardcoded keyword check.
    # We only need to mock the RAG generation call.
    mock_requests_post.return_value = MagicMock(
        status_code=200, 
        json=lambda: {"choices": [{"message": {"content": "It sounds like you are going through a difficult time. Please reach out to a crisis hotline."}}]}
    )
    mock_embedding_model.encode.return_value.tolist.return_value = [0.1] * 384
    mock_collection.query.return_value = {
        'documents': [['A crisis hotline provides immediate support.']],
        'metadatas': [[{'source': 'crisis_support.txt'}]],
        'distances': [[0.1]]
    }
    
    # --- Act ---
    response = client.post('/v1/agent/orchestrate', headers=HEADERS, data=json.dumps({
        "query": "I feel hopeless and want to kill myself."
    }))

    # --- Assert ---
    assert response.status_code == 200
    data = response.json
    # It should be handled by the Health Inquiry agent in a crisis context
    assert data['agent'] == "Health Inquiry Agent"
    assert "crisis hotline" in data['answer']
    assert len(data['sources']) > 0
