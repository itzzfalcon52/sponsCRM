import {prisma} from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client.js';
import z from 'zod';
import { sessionInclude, withActiveOrg } from './sessionModule.js';


export const registerSchema=z.object({
    email:z.string().trim().toLowerCase().pipe(z.email()),
    password:z.string().min(6),
    name:z.string().min(2).max(50),
})


export type RegisterInput=z.infer<typeof registerSchema>;
export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(6),
  });
  
  export type LoginInput = z.infer<typeof loginSchema>;

export const registerUser = async (input:RegisterInput)=> {
    try{
    const { email, password,name } = registerSchema.parse(input);
  const hashedPassword = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
}catch(error){
    if(error instanceof z.ZodError){
        throw new Error(`Validation error: ${error.issues.map(e=>e.message).join(', ')}`);
    }
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'){
        throw new Error('Email already exists');
    }
    throw error;
}
};

export const loginUser = async (input:LoginInput) => {
    const{ email, password } = loginSchema.parse(input);
    const found = await prisma.user.findUnique({
        where: { email },
        include: sessionInclude,
    });
    const user = found ? withActiveOrg(found) : null;
    if (!user || !user.password) {
        throw new Error("Invalid email or password");
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    
    const { password: _, ...safeUser } = user;
    return { ...safeUser, hasPassword: true };
}

// 1. Update Profile (Name)
export const updateUserDetails = async (userId:string, data:any) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
    include: sessionInclude,
  }).then(withActiveOrg);
};

// 2. Change Password
export const updateUserPassword = async (userId:string, currentPassword:string, newPassword:string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if(!user) throw new Error("User not found");
  
  if (!user.password) throw new Error("This account uses Google sign-in. Manage your password in your Google Account.");
  const parsed = z.object({
    currentPassword: z.string().min(6), newPassword: z.string().min(6),
  }).parse({ currentPassword, newPassword });
  const isMatch = await bcrypt.compare(parsed.currentPassword, user.password);
  if (!isMatch) throw new Error("Current password incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

// 3. Delete Account
export const deleteUserAccount = async (userId:string) => {
  // Logic: If user is an Admin, they should delete the org or transfer ownership first.
  // For now, we simply remove them.
  return await prisma.user.delete({
    where: { id: userId },
  });
};
