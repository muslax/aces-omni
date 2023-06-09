import { Context } from 'hono';
import { AbstractPage } from './page';
import { getAbstractKeys, getItemFromDoc } from '@/utils'
import { resetUserData } from '../utils';

const MAX = 10
const type = 'abstract';
const table = "abstract_userdata"

async function getScore(c: Context, seq: number, sel: string) {
  const keys = await getAbstractKeys(c);
  const key = keys[seq - 1];
  return key == sel ? 1 : 0;
}

const index = async (c: Context<{ Bindings: Env }>, p: Persona, rowid: string) => {
  // Check rowid
  const sql = `SELECT * FROM ${table} WHERE id=?`;
  const row: any = await c.env.DB.prepare(sql).bind(rowid).first();
  if (!row || row.uid != p.id) return c.text('Invalid row id', 400);

  // DEV: Reset
  // TODO: Decide what should be when user re-enter
  await resetUserData(c.env.DB, p, type, rowid);

  const title = 'Tes Abstract';
  const css = '';
  const js = '/static/js/abstract.js';

  return c.html(
    <AbstractPage
      //
      title={title}
      rowid={rowid}
      user={p}
      css={css}
      script={js}
    />
  );
};

const post = async (c: Context<{ Bindings: Env }>, p: Persona) => {
  const json = await c.req.json();
  const { version, rowid, reqid, data } = json;

  // Save userdata
  if (data) {
    const { seq, sel, elp } = data;
    const c1 = 's' + seq;
    const c2 = 'v' + seq;
    const c3 = 't' + seq;
    const score = await getScore(c, seq, sel);
    const finish = seq == MAX ? new Date().getTime() : 0;
    const sql = `UPDATE ${table} SET
    laststep=?, finish=?, ${c1}=?, ${c2}=?, ${c3}=?
    WHERE id=?`;
    console.log(sql);
    console.log(seq, finish, sel, score, elp, rowid);
    await c.env.DB.prepare(sql).bind(seq, finish, sel, score, elp, rowid).run();
  }

  // Simply return timestamp if req is falsy
  if (reqid == null) {
    return c.json({
      ts: new Date().getTime(),
      item: null,
    });
  }

  // Return timestamp with item
  const item = await getItemFromDoc(c.env.DB, 'abstract', version, reqid);
  return c.json({
    ts: new Date().getTime(),
    item: item,
  });
};

const Abstract = { index, post }
export default Abstract
