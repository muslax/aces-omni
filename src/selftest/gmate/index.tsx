import { Context } from 'hono';
import { GMATEPage } from './page';
import { getGMateKeys, getItemFromDoc } from '@/utils';
import { GMateElements, GMateMax } from './spec';
import { GmateConditions } from './conditions';
import { resetUserData } from '../utils';

const type = 'gmate';
const table = 'gmate_userdata';

const getScore = async (c: Context, seq: string, sel: string) => {
  const keys = await getGMateKeys(c);
  const pair = keys.find((k) => k.startsWith(seq));
  if (pair) {
    const x = pair.split(':')[1];
    return sel == x ? 1 : 0;
  }
  return 0;
}

const index = async (c: Context<{ Bindings: Env }>, p: Persona, rowid: string) => {
  // Check rowid
  const sql = `SELECT * FROM ${table} WHERE id=?`;
  const row: any = await c.env.DB.prepare(sql).bind(rowid).first();
  if (!row || row.uid != p.id) return c.text('Invalid row id', 400);

  // DEV: Reset
  // TODO: Decide what should be when user re-enter
  await resetUserData(c.env.DB, p, type, rowid);

  const title = 'Tes GMATE';
  const css = '';
  const js = '/static/js/gmate.js';
  const sequence = row.sequence.split(' ');

  return c.html(
    <GMATEPage
      //
      title={title}
      rowid={rowid}
      user={p}
      css={css}
      script={js}
      sequence={sequence.join(':')}
    />
  );
};

// TODO:
// Loading conditions
const post = async (c: Context<{ Bindings: Env }>, p: Persona) => {
  const json = await c.req.json();
  const { version, rowid, reqid, data } = json;
  console.log("reqid", reqid)

  /**
   * This will load all conditions
   */
  if (reqid && reqid.startsWith('conditions')) {
    // "conditions:v1"
    console.log("req with conditions")
    const id = reqid.split(':')[1];
    const item = await getItemFromDoc(c.env.DB, 'gmate', version, id);
    return c.json({
      ts: new Date().getTime(),
      item: item,
      conditions: GmateConditions,
    });
  }

  // Save userdata
  if (data) {
    // seq -> a1, a2, f1, m1, 2
    const { counter, seq, sel, elp } = data;
    const c1 = seq + 's';
    const c2 = seq + 'v';
    const c3 = seq + 't';
    const score = await getScore(c, seq, sel);
    const finish = counter == GMateMax ? new Date().getTime() : 0;
    const elements = GMateElements[seq as string];
    const array = elements.map((e) => `${e}=${e}+1`);
    // console.log(array);
    const updates = array.join(', '); // + ", lastseq=lastseq+1";

    const prefix = score == 1 ? `UPDATE ${table} SET ${updates}, ` : `UPDATE ${table} SET `;
    let sql = `${prefix} lastseq=?, finish=?, ${c1}=?, ${c2}=?, ${c3}=? WHERE id=?`;
    // console.log(sql, counter, finish, sel, score, elp, rowid);
    await c.env.DB.prepare(sql).bind(counter, finish, sel, score, elp, rowid).run();
  }

  // Simply return timestamp if req is falsy
  if (reqid == null) {
    return c.json({
      ts: new Date().getTime(),
      item: null,
    });
  }

  // Return timestamp with item
  const item = await getItemFromDoc(c.env.DB, 'gmate', version, reqid);
  // console.log(reqid, item);
  return c.json({
    ts: new Date().getTime(),
    item: item,
  });
};

const GMATE = { index, post };
export default GMATE;
