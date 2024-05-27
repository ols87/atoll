// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../ui/islands/chat/chat.umd';

describe('chat', () => {
  it('work', async () => {
    document.body.innerHTML = '<atoll-chat prop="chat"></atoll-chat>';
    expect(document.body.innerHTML).toContain('chat works');
  });
});
