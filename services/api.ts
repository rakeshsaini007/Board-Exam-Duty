
import { ApiResponse, Teacher } from '../types';

/**
 * IMPORTANT: Replace this URL with your actual deployed Google Apps Script Web App URL
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBNETe3s3pzZ-dZlTWxXRW6mmStjv_h7sv3V480cF94W5IUAA4IoMG3Hvrt9oW_WMaKw/exec';

export async function fetchAllData(): Promise<ApiResponse> {
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { status: 'error', message: 'Failed to fetch data from the server.' };
  }
}

export async function updateTeacherCentre(hrmsCode: string, centre: string): Promise<ApiResponse> {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', hrmsCode, centre }),
    });
    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    return { status: 'error', message: 'Failed to save data. Please check your connection.' };
  }
}
