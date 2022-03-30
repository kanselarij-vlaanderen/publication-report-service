import MuAuthSudo from '@lblod/mu-auth-sudo';

export async function update(query, asRoot) {
  if (asRoot) {
    try {
      await MuAuthSudo.updateSudo(query);
    } catch (err) {
      console.log(JSON.stringify(err), err.name, err.message, query);
      if (process.env.NODE_ENV === 'development') {
        throw new Error(query);
      } else {
        throw err;
      }
    }
  }
}
