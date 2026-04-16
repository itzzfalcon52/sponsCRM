import {prisma} from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client.js';
import z from 'zod';


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
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          orgId: true,
          password: true,
        },
      });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    
    const { password: _, ...safeUser } = user;
    return safeUser;
}

// 1. Update Profile (Name)
export const updateUserDetails = async (userId:string, data:any) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });
};

// 2. Change Password
export const updateUserPassword = async (userId:string, currentPassword:string, newPassword:string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if(!user) throw new Error("User not found");
  
  const isMatch = await bcrypt.compare(currentPassword, user.password);
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
