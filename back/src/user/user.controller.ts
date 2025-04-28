import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    console.log('Tentative de login:', body); // DEBUG

    return this.userService.validateUser(body.email, body.password);
  }
}
