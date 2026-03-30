/**
 * パスワードバリデーション
 * Supabase Auth（Authentication → Email）の設定に合わせる
 * - Minimum password length: 8
 * - Password Requirements: Lowercase, uppercase letters, digits and symbols
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
  "8文字以上、小文字・大文字・数字・記号をそれぞれ1文字以上含めてください";

/** チェックリスト表示用（Supabase の "Lowercase, uppercase letters, digits and symbols" に準拠） */
export const PASSWORD_REQUIREMENTS_ITEMS = [
  { key: "length", label: "8文字以上", test: (p: string) => p.length >= 8 },
  { key: "lowercase", label: "小文字（a-z）", test: (p: string) => /[a-z]/.test(p) },
  { key: "uppercase", label: "大文字（A-Z）", test: (p: string) => /[A-Z]/.test(p) },
  { key: "digit", label: "数字（0-9）", test: (p: string) => /\d/.test(p) },
  { key: "symbol", label: "記号（!@#$% など）", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

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
