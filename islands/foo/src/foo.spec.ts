import '../../../ui/islands/foo/foo.mjs';

describe('foo', () => {
  it('work', async () => {
    document.body.innerHTML = '<atoll-foo prop="foo"></atoll-foo>';
    expect(document.body.innerHTML).toContain('foo works');
  });
});
