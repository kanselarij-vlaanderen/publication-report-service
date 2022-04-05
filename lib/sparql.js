import Mu from 'mu';
import MuAuthSudo from '@lblod/mu-auth-sudo';

export async function query(query, asRoot) {
  try {
    if (asRoot) {
      return await MuAuthSudo.querySudo(query);
    } else {
      return await Mu.query(query);
    }
  } catch (err) {
    console.error(err.name, err.message, query);
    throw err;
  }
}

export async function update(query, asRoot) {
  try {
    if (asRoot) {
      await MuAuthSudo.updateSudo(query);
    } else {
      await Mu.update(query);
    }
  } catch (err) {
    console.error(err.name, err.message, query);
    throw err;
  }
}
