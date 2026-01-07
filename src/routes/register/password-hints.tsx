'use client';

import { type FC, useEffect, useState } from 'react';



import { CheckCircle } from '@medusajs/icons';
import { Container } from '@medusajs/ui';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

function validatePassword(password: string) {
  const errors = {
    tooShort: password.length < 8,
    noLower: !/[a-z]/.test(password),
    noUpper: !/[A-Z]/.test(password),
    noDigitOrSymbol: !/[0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)
  };

  return {
    isValid: !Object.values(errors).some(Boolean),
    errors
  };
}

const rules = {
  isValid: false,
  lower: false,
  upper: false,
  '8chars': false,
  symbolOrDigit: false
}

const PasswordRule: FC<{ isValid: boolean; ruleName: keyof typeof rules }> = ({ ruleName, isValid }) => {

  const { t } = useTranslation();
  if (ruleName === "isValid") return

  const rulesText: Record<Exclude<keyof typeof rules, "isValid">,string> = {
    lower: t('validation.rules.lower'),
    upper: t('validation.rules.upper'),
    '8chars': t('validation.rules.8chars'),
    symbolOrDigit: t('validation.rules.symbolOrDigit')
  }

  return (
    <p
      className={clsx(
        'flex items-center gap-2 text-xs',
        isValid ? 'text-red-700' : 'text-green-700'
      )}
    >
      <CheckCircle /> {rulesText[ruleName]}
    </p>
  );
};

export const PasswordValidator = ({
  password,
  setError
}: {
  password: string;
  setError: (error: any) => void;
}) => {
  const [newPasswordError, setNewPasswordError] = useState(rules)

  useEffect(() => {
    const validation = validatePassword(password);

    setError({
      isValid: validation.isValid,
      lower: validation.errors.noLower,
      upper: validation.errors.noUpper,
      '8chars': validation.errors.tooShort,
      symbolOrDigit: validation.errors.noDigitOrSymbol
    });
    setNewPasswordError({
      isValid: validation.isValid,
      lower: validation.errors.noLower,
      upper: validation.errors.noUpper,
      '8chars': validation.errors.tooShort,
      symbolOrDigit: validation.errors.noDigitOrSymbol
    });
  }, [password]);


  return (
    <Container className="p-2 flex flex-col gap-y-1">
      {
        (Object.keys(newPasswordError) as (keyof typeof rules)[]).map(k => (
          <PasswordRule key={k} ruleName={k} isValid={newPasswordError[k]} />
        ))
      }
    </Container>
  );
};
