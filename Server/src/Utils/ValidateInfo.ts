import validator from 'validator';
 


interface ValidateInfoInput{

   emailId: string,
   password: string
}

const ValidateInfo = (val: ValidateInfoInput): {message?: string, isValid: boolean} => {

  const { emailId, password } = val;

  if (!validator.isEmail(emailId)){
      return{
         message: "Invalid email",
         isValid: false
      }
   }
   if (!validator.isStrongPassword(password)){
      return{
         message: "Password is not strong enough",
         isValid: false
      }
   }

   return{
      isValid: true
   };
};

export default ValidateInfo;
