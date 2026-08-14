import { proxy } from 'valtio';

const state = proxy<{
  selected: number;
}>({
  selected: 0,
});

export default state;
