import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class SignUpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  birthDate?: string; // ISO date string
}

export class ResetPasswordRequestDto {
  @IsEmail()
  email!: string;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
