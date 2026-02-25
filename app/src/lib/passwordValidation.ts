/**
 * パスワードバリデーション（乗っ取り防止のためセキュアな要件）
 * NIST/OWASP ガイドラインに基づく
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
} as const;

export const PASSWORD_REQUIREMENTS_LABEL =
  "8文字以上、大文字・小文字・数字・記号をそれぞれ1文字以上含めてください";

export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`パスワードは${PASSWORD_REQUIREMENTS.minLength}文字以上で入力してください`);
  }
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`パスワードは${PASSWORD_REQUIREMENTS.maxLength}文字以内で入力してください`);
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("大文字を1文字以上含めてください");
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("小文字を1文字以上含めてください");
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push("数字を1文字以上含めてください");
  }
  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[^A-Za-z0-9\s]/.test(password)) {
    errors.push("記号を1文字以上含めてください（例: !@#$% など）");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
