// SMS utility functions using BulkSMSBD API
import fetch from 'node-fetch';

const SMS_API_BASE_URL = 'https://bulksmsbd.net/api';

function getProviderCode(responseText) {
  try {
    const parsed = JSON.parse(responseText);
    const code = parsed.response_code ?? parsed.code ?? parsed.status_code ?? parsed.status;
    return code == null ? null : String(code);
  } catch (_) {
    const match = String(responseText).match(/(?:response[_ ]?code|code|status)[^0-9]*(\d{3,4})/i)
      || String(responseText).match(/^\s*(\d{3,4})\b/);
    return match ? match[1] : null;
  }
}

export async function checkSMSBalance() {
  const apiKey = process.env.BULKSMS_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, skipped: true, message: 'BULKSMS_API_KEY is not configured.' };
  }

  try {
    const url = `${SMS_API_BASE_URL}/getBalanceApi?api_key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { method: 'GET' });
    const responseText = (await response.text()).trim();
    const providerCode = getProviderCode(responseText);
    const knownErrorCode = providerCode && providerCode !== '202';

    if (!response.ok || knownErrorCode || !responseText) {
      return {
        ok: false,
        skipped: false,
        status: response.status,
        providerCode,
        message: responseText || response.statusText || 'Empty provider response.',
      };
    }

    return {
      ok: true,
      skipped: false,
      status: response.status,
      message: 'BulkSMSBD credentials were accepted by the balance endpoint.',
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      message: error?.message || 'BulkSMSBD connection failed.',
    };
  }
}

export async function sendSMS(number, message) {
  try {
    // Using the same API as found in the signup process
    const apiKey = process.env.BULKSMS_API_KEY || '';
    const senderid = process.env.BULKSMS_SENDER_ID || 'SlumLink';
    
    if (!apiKey) {
      console.warn('⚠️ BulkSMSBD API key not configured');
      return false;
    }
    
    const url = `${SMS_API_BASE_URL}/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(number)}&senderid=${encodeURIComponent(senderid)}&message=${encodeURIComponent(message)}`;
    
    // Use GET method as per the existing implementation
    const response = await fetch(url, { method: 'GET' });
    const responseText = await response.text();
    
    const providerCode = getProviderCode(responseText);
    if (response.ok && providerCode === '202') {
      console.log('📱 SMS sent successfully to:', number);
      return true;
    }

    console.error('❌ SMS send failed:', {
      httpStatus: response.status,
      providerCode,
      providerResponse: responseText,
    });
    return false;
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return false;
  }
}

export function createVerificationMessage(slumCode) {
  return `SlumLink account verification completed successfully. Please log in using your registered credentials. Slum ID: ${slumCode}.
SlumLink`;
}

// Create OTP message for spouse verification during add member process
export function createOTPMessage(otp, spouseName, verificationType = 'spouse verification') {
  return `Your SlumLink OTP for ${verificationType} is: ${otp}. Valid for 5 minutes. Name: ${spouseName}. Do not share this code.
- SlumLink`;
}

// Create spouse addition approval message
export function createSpouseAddedMessage(spouseName, slumDwellerName) {
  return `${spouseName} has been added as spouse by ${slumDwellerName}. For any query, contact SlumLink.
- SlumLink`;
}

// Create spouse removal message  
export function createSpouseRemovedMessage(spouseName, slumDwellerName) {
  return `${spouseName} has been removed as spouse by ${slumDwellerName}. For any query, contact SlumLink.
- SlumLink`;
}