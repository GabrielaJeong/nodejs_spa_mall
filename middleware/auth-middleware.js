const jwt = require('jsonwebtoken');
const { Users } = require('../models');

const jwtValidation = async (req, res, next) => {
    try {
        const cookies = req.cookies['middleProjectCookie'];
        if (!cookies) {
            return res.status(403).send({
                errorMessage: '로그인이 필요한 기능입니다.',
            });
        }

        const [tokenType, tokenValue] = cookies.split(' ');
        if (tokenType !== 'Bearer') {
            res.clearCookie('middleProjectCookie'); // authorization failed > Cookie bye
            return res.status(403).send({
                errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.',
            });
        }

        const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET);
        const user = await Users.findByPk(userId);

        res.locals.user = user;
        next();

    } catch (error) {
        res.clearCookie('middleProjectCookie'); // cookie bye
        console.error(error);
        return res.status(403).send({
            errorMessage: '로그인이 필요한 기능입니다.',
        });
    }
};

module.exports = jwtValidation;