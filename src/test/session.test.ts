import { test, expect, describe, beforeEach } from 'vitest';
import { callApi, chkToken, DB, store } from '../lib/powerloop';

describe('Secure Session Store', () => {
  beforeEach(() => {
    store.del('pl_db_sess');
    store.del('pl_db_usr');
    store.del('pl_db_otp');
  });

  test('chkToken rejects invalid tokens', () => {
    expect(() => chkToken('invalid_token')).toThrow('Session expired — please log in again');
  });

  test('callApi /auth/send-otp and /auth/verify-otp creates a valid secure token', async () => {
    const resOtp = await callApi('/auth/send-otp', 'POST', { phone: '1234567890' });
    expect(resOtp.message).toBe('OTP sent');

    const resVerify = await callApi('/auth/verify-otp', 'POST', { phone: '1234567890', otp: resOtp.dev_otp });
    expect(resVerify.status).toBe('NEW_USER');
    expect(resVerify.verify_token).toBeDefined();

    // ensure it is stored in DB.sessions
    const sessions = DB.sessions.get();
    expect(sessions[resVerify.verify_token]).toBeDefined();
    expect(sessions[resVerify.verify_token].phone).toBe('1234567890');
  });

  test('callApi /auth/register and token flow', async () => {
    const resOtp = await callApi('/auth/send-otp', 'POST', { phone: '0987654321' });
    const resVerify = await callApi('/auth/verify-otp', 'POST', { phone: '0987654321', otp: resOtp.dev_otp });

    const resReg = await callApi('/auth/register', 'POST', {
      verify_token: resVerify.verify_token,
      name: 'Test User',
      email: 'test@example.com'
    });

    expect(resReg.token).toBeDefined();
    expect(resReg.user.name).toBe('Test User');
    expect(resReg.user.phone).toBe('0987654321');

    // verify token was deleted from sessions
    const sessions = DB.sessions.get();
    expect(sessions[resVerify.verify_token]).toBeUndefined();

    // verify new auth token is in sessions
    expect(sessions[resReg.token]).toBeDefined();
    expect(sessions[resReg.token].uid).toBe(resReg.user.id);

    // verify chkToken works
    const parsed = chkToken(resReg.token);
    expect(parsed.uid).toBe(resReg.user.id);
  });
});
