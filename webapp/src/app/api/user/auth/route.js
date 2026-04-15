import { getDB } from '../../../../lib/db';

export async function POST(request) {
  const { action, email, password, name } = await request.json();
  const db = getDB();

  try {
    if (action === 'signup') {
      // Check if email already exists
      const { data: existing } = await db
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
      }

      // Insert new user
      const { data: newUser, error: insertError } = await db
        .from('users')
        .insert([{
          email,
          password,
          name: name || email.split('@')[0],
        }])
        .select('id, name, email, reward_points')
        .single();

      if (insertError) throw new Error(insertError.message);

      return new Response(JSON.stringify({ success: true, user: newUser }), { status: 201 });
    }

    else if (action === 'login') {
      const { data: user, error: loginError } = await db
        .from('users')
        .select('id, name, email, reward_points')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (loginError) throw new Error(loginError.message);

      if (user) {
        return new Response(JSON.stringify({ success: true, user }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
      }
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
