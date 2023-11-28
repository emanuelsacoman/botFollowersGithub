const axios = require('axios');

const username = ''; // nome do usuario
const accessToken = ''; // seu token
const perPage = 100;

const getFollowing = async () => {
    let page = 1;
    let usersFollowing = [];

    try {
        while (true) {
            const response = await axios.get(`https://api.github.com/users/${username}/following?per_page=${perPage}&page=${page}`, {
                headers: {
                    Authorization: `token ${accessToken}`,
                },
            });

            const users = response.data.map(user => user.login);
            usersFollowing = usersFollowing.concat(users);

            if (users.length < perPage) {
                break;
            }

            page++;
        }

        return usersFollowing;
    } catch (error) {
        console.error('Erro ao obter a lista de usuários seguidos:', error.response ? error.response.data : error.message);
        return [];
    }
};

const getFollowers = async () => {
    try {
        const response = await axios.get(`https://api.github.com/user/followers`, {
            headers: {
                Authorization: `token ${accessToken}`,
            },
        });

        const followers = response.data.map(follower => follower.login);
        return followers;
    } catch (error) {
        console.error('Erro ao obter a lista de seguidores:', error.response ? error.response.data : error.message);
        return [];
    }
};

const unfollowUsersNotFollowingBack = async () => {
    const usersFollowing = await getFollowing();
    const followers = await getFollowers();

    const usersNotFollowingBack = usersFollowing.filter(user => !followers.includes(user));

    if (usersNotFollowingBack.length > 0) {
        try {
            for (const user of usersNotFollowingBack) {
                await axios.delete(`https://api.github.com/user/following/${user}`, {
                    headers: {
                        Authorization: `token ${accessToken}`,
                    },
                });
                console.log(`Deixou de seguir o usuário ${user}.`);
                await delay(10000); // Recomendo não alterar para evitar exceder os limites de solicitação da API
            }
        } catch (error) {
            console.error('Erro ao tentar deixar de seguir usuários:', error.response ? error.response.data : error.message);
        }
    } else {
        console.log('Você está seguindo todos os seguidores do GitHub.');
    }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

unfollowUsersNotFollowingBack();