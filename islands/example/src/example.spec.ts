import '../../../ui/islands/example/example.mjs';

describe('example', () => {
  it('work', async () => {
    document.body.innerHTML = '<atoll-example prop="example"></atoll-example>';
    expect(document.body.innerHTML).toContain('example works');
  });
});
