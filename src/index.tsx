import './index.css';
import {
  createAnimation,
  createBatch,
  createGameLoop,
  createStage,
  createViewport,
  createViewportAwareInputHandler,
  createWhiteTexture,
  loadAtlas,
  loadTexture,
  PlayMode,
  Vector2
} from 'gdxjs';

// WebGL

const init = async () => {
  const stage = createStage();
  const canvas = stage.getCanvas();

  const viewport = createViewport(canvas, 50, 100);

  const gl = viewport.getContext();
  const camera = viewport.getCamera();

  const inputHandler = createViewportAwareInputHandler(canvas, viewport);

  const batch = createBatch(gl);
  const whiteTex = createWhiteTexture(gl);
  const logo = await loadTexture(gl, './logo192.png');

  const mainAtlas = await loadAtlas(gl, './main.atlas', {});
  const runRegions = mainAtlas.findRegions('mina_run');
  const runAnimation = createAnimation(0.1, runRegions);

  const balls: { x: number; y: number }[] = [];
  const DROP_RATE = 2;
  let accumulate = 0;

  const BALL_FALLING_SPEED = 50;
  const BALL_SIZE = 10;

  let paddlePosition = new Vector2(25, 90);
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 2;

  const PADDLE_SPEED = 25;

  let stateTime = 0;

  gl.clearColor(0, 0, 0, 1);
  createGameLoop(delta => {
    if (inputHandler.isTouched()) {
      const targetX = inputHandler.getTouchedWorldCoord().x;
      let speed = 0;
      const deltaX = targetX - paddlePosition.x;
      if (Math.abs(deltaX) <= PADDLE_SPEED * delta) {
        paddlePosition.x = targetX;
      } else if (deltaX > 0) {
        speed = PADDLE_SPEED;
      } else if (deltaX < 0) {
        speed = -PADDLE_SPEED;
      }
      paddlePosition.x += speed * delta;
    }
    accumulate += delta;
    if (accumulate > DROP_RATE) {
      accumulate = 0;
      balls.push({
        x: Math.random() * 50,
        y: 0
      });
    }
    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];
      ball.y += BALL_FALLING_SPEED * delta;
      if (ball.y > 100) {
        balls.splice(i, 1);
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    batch.setProjection(camera.combined);
    batch.begin();
    batch.draw(whiteTex, 0, 0, 50, 100);
    for (let ball of balls) {
      batch.draw(
        logo,
        ball.x - BALL_SIZE / 2,
        ball.y - BALL_SIZE / 2,
        BALL_SIZE,
        BALL_SIZE
      );
    }
    batch.setColor(0.4, 0.4, 0.4, 1);
    batch.draw(
      whiteTex,
      paddlePosition.x - PADDLE_WIDTH / 2,
      paddlePosition.y - PADDLE_HEIGHT / 2,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
    batch.setColor(1, 1, 1, 1);

    stateTime += delta;
    runAnimation
      .getKeyFrame(stateTime, PlayMode.LOOP)
      .draw(batch, 0, 0, 30, 30);

    batch.end();
  });
};

init();

/**
 * 1. Typescript
 * 2. WebGL
 * 3. Async/await, promise
 */
