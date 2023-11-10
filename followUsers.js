const axios = require('axios');

const username = 'nome_do_usuario_que_deseja'; 
const accessToken = 'seu_token';
const perPage = 100;

const getUsersFollowed = async () => {
    let page = 1;
    let usersToFollow = [];
  
    try {
      while (true) {
        const response = await axios.get(`https://api.github.com/users/${username}/following?per_page=${perPage}&page=${page}`, {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });
  
        const users = response.data.map(user => user.login);
        usersToFollow = usersToFollow.concat(users);
  
        if (users.length < perPage) {
          break;
        }
  
        page++;
      }
  
      return usersToFollow;
    } catch (error) {
      console.error('Erro ao obter a lista de usuários seguidos:', error.response ? error.response.data : error.message);
      return [];
    }
  };  

const followUsers = async () => {
  const usersToFollow = await getUsersFollowed();

  if (usersToFollow.length > 0) {
    try {
      for (const user of usersToFollow) {
        const isFollowing = await checkFollowing(user);
        if (!isFollowing) {
          await axios.put(`https://api.github.com/user/following/${user}`, {}, {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          });
          console.log(`Seguiu o usuário ${user}.`);
          await delay(10000); //recomendo que não altere
        } else {
          console.log(`Você já está seguindo o usuário ${user}.`);
        }
      }
    } catch (error) {
      console.error('Erro ao tentar seguir usuários:', error.response.data);
    }
  } else {
    console.log('Nenhum usuário encontrado para seguir.');
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const checkFollowing = async (user) => {
    try {
        const response = await axios.get(`https://api.github.com/user/following/${user}`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
        });
        return response.status === 204;
    } catch (error) {
        if (error.response && error.response.status === 404) {
        return false;
        } else {
        console.error(`Erro ao verificar se está seguindo ${user}:`, error.response ? error.response.data : error.message);
        return false;
        }
    }
};

followUsers();