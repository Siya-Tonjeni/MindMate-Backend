import bcrypt from 'bcryptjs';


export const hash = async (plain: string) => {
const salt = await bcrypt.genSalt(10);
return bcrypt.hash(plain, salt);
};


export const compare = async (plain: string, hashed: string) => {
return bcrypt.compare(plain, hashed);
};