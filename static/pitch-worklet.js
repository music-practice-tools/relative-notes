// Self-contained AudioWorklet processor that captures live microphone audio into
// fixed-size, sample-accurate blocks. It intentionally has NO imports so it can be
// loaded via `audioContext.audioWorklet.addModule(url)` without a bundler.
//
// NOTE (latency tradeoff): windowSize is passed from the main thread (default 8192 ≈
// 186 ms at 44.1 kHz). A longer window gives low notes more periods to correlate
// against — important for bass — at the cost of latency. 4096 (~93 ms) is a good
// middle ground; drop to 2048 (~46 ms) for a snappier UI at the cost of low-end
// resolution.
// hopSize controls update rate/overlap: smaller = smoother but more CPU.

class PitchCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    // windowSize is passed from the main thread via processorOptions so the
    // detector (PitchDetector.forFloat32Array) always matches the block length.
    this.windowSize = options?.processorOptions?.windowSize || 8192
    this.hopSize = 1024
    this.ring = new Float32Array(this.windowSize)
    this.writePos = 0
    this.sincePost = 0
    this.filled = false
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length === 0) return true

    const channel = input[0] // mono; the node is configured with channelCount: 1

    for (let i = 0; i < channel.length; i++) {
      this.ring[this.writePos] = channel[i]
      this.writePos = (this.writePos + 1) % this.windowSize
      if (!this.filled && this.writePos === 0) this.filled = true
      this.sincePost++

      if (this.filled && this.sincePost >= this.hopSize) {
        this.sincePost = 0

        // Assemble the most recent windowSize samples in chronological order.
        const block = new Float32Array(this.windowSize)
        for (let j = 0; j < this.windowSize; j++) {
          block[j] = this.ring[(this.writePos + j) % this.windowSize]
        }

        // Transfer (zero-copy); block is freshly allocated, so detaching is safe.
        this.port.postMessage(block, [block.buffer])
      }
    }

    return true // keep the processor alive
  }
}

registerProcessor('pitch-capture', PitchCaptureProcessor)
