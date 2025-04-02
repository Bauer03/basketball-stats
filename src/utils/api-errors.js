export async function handleApiResponse(response) {
  if (!response.ok) {
    const error = new Error('API request failed')
    error.status = response.status
    try {
      const data = await response.json()
      error.message = data.message || data.error || 'An error occurred'
    } catch (e) {
      error.message = `HTTP error! status: ${response.status}`
    }
    throw error
  }
  
  try {
    return await response.json()
  } catch (e) {
    throw new Error('Failed to parse response data')
  }
} 