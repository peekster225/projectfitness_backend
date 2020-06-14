
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import * as jwt from 'jsonwebtoken'
import * as bcrypt from "bcryptjs";
import { User } from "../entity/User";
import config from "../config/config";
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from "constants";

class AuthController {

	static register = async (req: Request, res: Response) => {
        let { username, password } = req.body;
        if(!username || !password) {
            res.status(409).send('Username and password required.');
            return;
        }

        const userRepository = getRepository(User);
        let user: User;

        //Check if username is taken
        try {
            user = await userRepository.findOne({ where: { username } });
        }
        catch(e) {
            console.error(e);
            return;
        }

        if (user) {
            res.status(409).send("Username Taken.");
            return;
        }

        user = userRepository.create({ username: username, password: password });
        userRepository.save(user);
        res.status(201).send('Registered!');
        return;
    };
    
	static login = async (req: Request, res: Response) => {
        let { username, password } = req.body;

        if(!username || !password) {
            res.status(409).send('Username and password required.')
            return;
        }

        const userRepository = getRepository(User)
        let user: User;

        try {
            user = await userRepository.findOne({ where: { username } });
        }
        catch(e) {
            console.error(e);
            return;
        }

        if(!user) {
            res.status(404).send("Username or password is incorrect.")
            return;
        }

        //check if password is correct
        let passwordsMatch: boolean = await bcrypt.compare(password, user.password)

        if(!passwordsMatch) {
            res.status(404).send('Username or password is incorrect.')
            return;
        }

        //TODO: add JWT to user
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            config.jwtSecret,
            { expiresIn: '6h' }
        )

        res.status(202).send('Successful Login!\nToken: ' + token);
        return;
	};

    static changePassword = async (req: Request, res: Response) => {

        let { oldPassword, newPassword } = req.body;
        const id: string = res.locals.jwtPayload.userId;

        if(!oldPassword || !newPassword) {
            res.status(409).send('Old and new password required.');
            return;
        }

        const userRepository = getRepository(User);
        let user: User;
        //make sure the old password is the current password stored
        try {
            user = await userRepository.findOne(id);
        }
        catch(e) {
            console.error(e);
            return;
        }

        if(!user) return;
        
        let oldPasswordMatches:boolean = await bcrypt.compare(oldPassword, user.password);

        if(!oldPasswordMatches) {
            res.status(409).send('Old password is incorrect.');
            return;
        }
        
        let saltRounds: number = 10;
        let newHashedPassword:string = await bcrypt.hash(newPassword, saltRounds);
        user.password = newHashedPassword;
        await userRepository.save(user);
        res.status(202).send("Password Changed.");
        return;
    };

}


export default AuthController;