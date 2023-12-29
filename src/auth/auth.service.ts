import { ConflictException, Injectable, UnauthorizedException} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role, User } from "./schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { HttpStatus } from "@nestjs/common";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client('134575829737-ukmecg47kp10fpg20po5bo5h6k6r30uo.apps.googleusercontent.com');

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ) {}

    /**
     * Function used by the method "register" in AuthController to store new user to the database
     * @param registerDto See the definition of the registerDto file to see the list of required propriety
     * @returns Return a promise with the HTTP status and a message
     */
    async register(registerDto: RegisterDto) : Promise<{status: HttpStatus, message: string}> {
        const { username, email, password, gender, number, birthdate, preferences } = registerDto
        const hash = await bcrypt.hash(password, 10)
        try {
            await this.userModel.create({
                username,
                email,
                gender,
                role: Role.USER,
                birthdate,
                number,
                password: hash,
                preferences: preferences,
                style : {
                    head: "0",
                    body: "0",
                    pants: "0",
                    shoes: "0",
                },
                unlockedStyle : {
                    head: ["0"],
                    body: ["0"],
                    pants: ["0"],
                    shoes: ["0"],
                }
            })
        } catch(error) {
            if (error.code === 11000) {
                throw new ConflictException("Duplicated key")
            }
        }
        return {status: HttpStatus.CREATED, message: "Succesfully created !"}
    }

    /**
     * Function used by the method "login" in AuthController to login an user
     * @param loginDto See the definition of the loginDto file to see the list of required propriety
     * @returns Return a promise with the HTTP status an AuthToken and a RefreshToken
     */

    async login(loginDto : LoginDto) : Promise<{status: HttpStatus, token: string, refresh : string}> {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException("Invalid credentials")
        }
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            throw new UnauthorizedException("Invalid credentials")
        }
        const token = this.jwtService.sign({id: user._id, role: user.role});
        const refreshToken = this.jwtService.sign({id: user._id, role: user.role}, {expiresIn: '90d', secret:'123456'});
        return {status: HttpStatus.ACCEPTED, token: token ,refresh: refreshToken};
    }

    /**
     * Function user by the method "refresh" in AuthController to refresh AuthToken
     * @param user User is the current user who want to refresh his token
     * @param head actualRefresh is the refreshToken of the user
     * @returns Return a promise with the HTTP status and a new AuthToken and the RefreshToken
     */
    async refresh(user : User, actualRefresh: string) : Promise<{status: HttpStatus, token: string, refresh : string}>{
        return {status: HttpStatus.ACCEPTED,token: this.jwtService.sign({id: user._id}), refresh: actualRefresh}
    }

    async googleLogin(tokenId: string) : Promise<{status: HttpStatus, token: string, refresh : string}> {
        console.log(tokenId);
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: [
                '134575829737-ukmecg47kp10fpg20po5bo5h6k6r30uo.apps.googleusercontent.com',
            ]
        });
        console.log("verified")
        const email = ticket.getPayload()?.email ?? '';
        const username = ticket.getPayload()?.name ?? '';
        if (!email || !username) {
            throw new ConflictException('Email or username could not be verified');
        }
        let user = await this.userModel.findOne({email: email});
        if (!user) {
            user = await this.userModel.create({
                email: email,
                password: email+'asdsdsddsds',
                style : {
                    head: "0",
                    body: "0",
                    pants: "0",
                    shoes: "0",
                },
                role: Role.USER,
                unlockedStyle : {
                    head: ["0"],
                    body: ["0"],
                    pants: ["0"],
                    shoes: ["0"],
                }
            })
        }
        const token = this.jwtService.sign({id: user._id, role: user.role});
        const refreshToken = this.jwtService.sign({id: user._id, role: user.role}, {expiresIn: '90d', secret:'123456'});
        return {status: HttpStatus.ACCEPTED, token: token ,refresh: refreshToken};
    }
}