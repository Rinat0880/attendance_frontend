import { useTranslation } from "react-i18next";
import { FormErrors } from "./types";

export const useErrorHandler = () => {
  const { t } = useTranslation("common");

  const parseApiError = (errorMessage: string): FormErrors => {
    const errors: FormErrors = {};

    switch (true) {
      case errorMessage.includes("入力は半角文字のみ使用可能 'employee_id'"):
        errors.employee_id = "入力は半角文字のみ使用可能";
        return errors;

      case errorMessage.includes("入力は半角文字のみ使用可能 'last_name'"):
        errors.last_name = "入力は半角文字のみ使用可能";
        return errors;

      case errorMessage.includes("入力は半角文字のみ使用可能 'first_name'"):
        errors.first_name = "入力は半角文字のみ使用可能";
        return errors;

      case errorMessage.includes("入力は半角文字のみ使用可能 'nick_name'"):
        errors.nick_name = "入力は半角文字のみ使用可能";
        return errors;

      case errorMessage.includes("入力は半角文字のみ使用可能 'email'"):
        errors.email = "入力は半角文字のみ使用可能";
        return errors;

      case errorMessage.includes("入力は半角文字のみ使用可能 'phone'"):
        errors.phone = "入力は半角文字のみ使用可能";
        return errors;

      case errorMessage.includes("メールアドレス はすでに使用されています。"):
        errors.email = errorMessage;
        return errors;

      case errorMessage.includes("社員番号はすでに使用されています"):
        errors.employee_id = errorMessage;
        return errors;

      case errorMessage.includes("無効な電話番号形式"):
        errors.phone = errorMessage;
        return errors;

      case errorMessage.includes("無効なメールアドレス形式"):
        errors.email = errorMessage;
        return errors;

      case errorMessage.includes("必須項目は空欄にできません"):
        errors.general = errorMessage;
        return errors;

      case errorMessage.includes("invalid department ID"):
        errors.department = errorMessage;
        return errors;

      case errorMessage.includes("invalid position ID"):
        errors.position = errorMessage;
        return errors;

      case errorMessage.includes("employee not found"):
        errors.general = errorMessage;
        return errors;

      default:
        errors.general = errorMessage;
        return errors;
    }
  };

  // Make the function more generic to work with any form data object 入力は半角文字のみ使用可能 'employee_id'
  const validateForm = (data: any): FormErrors => {
    const errors: FormErrors = {};

    if (!data.employee_id || data.employee_id.trim() === "") {
      errors.employee_id = t("errors.requiredField");
    }

    if (!data.first_name || data.first_name.trim() === "") {
      errors.first_name = t("errors.requiredField");
    }

    if (!data.last_name || data.last_name.trim() === "") {
      errors.last_name = t("errors.requiredField");
    }

    if (!data.email || data.email.trim() === "") {
      errors.email = t("errors.requiredField");
    }

    if (!data.role || data.role.trim() === "") {
      errors.role = t("errors.requiredField");
    }

    if (!data.department || data.department.trim() === "") {
      errors.department = t("errors.requiredField");
    }

    if (data.department && (!data.position || data.position.trim() === "")) {
      errors.position = t("errors.requiredField");
    }

    if (data.nick_name && data.nick_name.length > 7) {
      errors.nick_name = "ニックネームは7文字以内で入力してください";
    }

    return errors;
  };

  return { parseApiError, validateForm };
};
