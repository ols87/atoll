// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../ui/islands/example/example.umd';

describe('example', () => {
  it('work', async () => {
    document.body.innerHTML = '<atoll-example prop="example"></atoll-example>';
    expect(document.body.innerHTML).toContain('example works');
  });
});
