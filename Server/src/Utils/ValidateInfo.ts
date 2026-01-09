import validator from "validator";

interface ValidateInfoInput {
   email: string;
   password: string;
}

interface ValidateInfoOutput {
   isValid: boolean;
   message?: string;
}

const ValidateInfo = (val: ValidateInfoInput): ValidateInfoOutput => {
   const { email, password } = val;

   if (!validator.isEmail(email)) {
      return {
         isValid: false,
         message: "Invalid email",
      };
   }

   if (!validator.isStrongPassword(password)) {
      return {
         isValid: false,
         message: "Password is not strong enough",
      };
   }

   return {
      isValid: true,
   };
};

export default ValidateInfo;
