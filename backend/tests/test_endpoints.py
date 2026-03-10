import pytest
from unittest.mock import AsyncMock, patch

from app.routers import faces

@pytest.mark.asyncio
async def test_detect_no_face(async_client):
    # Mock image file
    files = {'file': ('test.jpg', b'\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00...', 'image/jpeg')}
    
    # Mock the service response
    with patch('app.routers.faces.face_service.process_image', new_callable=AsyncMock) as mock_process:
        mock_process.return_value = []
        
        response = await async_client.post("/api/v1/faces/detect", files=files)
        assert response.status_code == 200
        assert response.json() == []

@pytest.mark.asyncio
async def test_detect_face_found(async_client):
    files = {'file': ('test.jpg', b'fakecontent', 'image/jpeg')}
    
    mock_result = [{"location": [10, 10, 100, 100], "embedding": [0.1]*128}]
    
    with patch('app.routers.faces.face_service.process_image', new_callable=AsyncMock) as mock_process:
        mock_process.return_value = mock_result
        
        response = await async_client.post("/api/v1/faces/detect", files=files)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["embedding"][0] == 0.1
