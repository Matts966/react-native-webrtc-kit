// @flow

import { NativeModules } from 'react-native';
import RTCMediaStreamTrack from '../MediaStream/RTCMediaStreamTrack';
import RTCMediaStreamConstraints from '../MediaStream/RTCMediaStreamConstraints';
import RTCMediaStreamError from '../MediaStream/RTCMediaStreamError';
import logger from '../Util/RTCLogger';

/** @private */
const { WebRTCModule } = NativeModules;

/**
 * {@link getUserMedia} で取得できるメディア情報入力トラックの情報です。
 *
 * @since 1.1.0
 */
export class RTCUserMedia {

  /** @private */
  static nativeGetUserMedia(constraints: RTCMediaStreamConstraints): Promise<Object> {
    return WebRTCModule.getUserMedia(constraints.toJSON());
  }

  /** @private */
  static nativeStopUserMedia() {
    WebRTCModule.stopUserMedia();
  }

  /** @private */
  static nativeGetDisplayMedia(constraints: RTCMediaStreamConstraints): Promise<Object> {
    return WebRTCModule.getDisplayMedia(constraints.toJSON());
  }

  /** @private */
  static nativeStopDisplayMedia(constraints: RTCMediaStreamConstraints): Promise<Object> {
    return WebRTCModule.stopDisplayMedia();
  }

  /** 入力トラックのリスト。
   * リストの並びは順不同です。
   */
  tracks: Array<RTCMediaStreamTrack>;

  /** トラックが属するストリーム ID */
  streamId: string;

  /**
   * @ignore
   */
  constructor(tracks: Array<RTCMediaStreamTrack>, streamId: string) {
    this.tracks = tracks;
    this.streamId = streamId;
  }

}

/**
 * カメラやマイクなどのメディア情報入力デバイスのトラックを生成します。
 * この関数を実行するとデバイスの使用許可がユーザーに要求され、
 * ユーザーが許可すると、 Promise は {@link RTCUserMedia} を引数として解決されます。
 * {@link RTCPeerConnection} でトラックを利用するには `addTrack()` で追加します。
 *
 * この関数で生成されるトラックの使用は一度きりです。
 * 再び入力デバイスを使う場合は、再度この関数を実行して
 * 新しいトラックを生成する必要があります。
 *
 * @example
 * getUserMedia(null).then((info) => {
 *   var pc = new RTCPeerConnection();
 *   info.tracks.forEach(track =>
 *     pc.addTrack(track, [info.streamId])
 *   );
 *   ...
 * });
 *
 * @param {RTCMediaStreamConstraints|null} constraints トラックの制約
 * @returns {Promise<RTCUserMedia>} トラックの取得の結果を表す Promise 。
 *  エラー時は {@link RTCMediaStreamError} が渡されます。
 * @version 1.1.0
 */
export function getUserMedia(constraints: RTCMediaStreamConstraints | null):
  Promise<RTCUserMedia> {
  logger.log("# get user media");
  if (constraints == null) {
    constraints = new RTCMediaStreamConstraints();
  }
  return RTCUserMedia.nativeGetUserMedia(constraints)
    .then(ev => {
      var tracks = [];
      for (const track of ev.tracks) {
        tracks.push(new RTCMediaStreamTrack(track));
      }
      return new RTCUserMedia(tracks, ev.streamId);
    })
    .catch(({ message, code }) => {
      let error;
      switch (code) {
        case 'TypeError':
          error = new TypeError(message);
          break;
      }
      if (!error) {
        error = new RTCMediaStreamError({ message, name: code });
      }
      throw error;
    });

}

/**
 * 稼働中のすべてのメディア入力デバイスを停止します。
 * デバイスの停止中はストリームにメディアデータが送信されません。
 * 再開するには {@link getUserMedia} を実行します。
 *
 * @returns {void}
 */
export function stopUserMedia(): void {
  logger.log("# stop user media");
  RTCUserMedia.nativeStopUserMedia();
}

export function getDisplayMedia(constraints: RTCMediaStreamConstraints | null):
  Promise<RTCUserMedia> {
  logger.log("# get display media");
  if (constraints == null) {
    constraints = new RTCMediaStreamConstraints();
  }
  return RTCUserMedia.nativeGetDisplayMedia(constraints)
    .then(ev => {
      var tracks = [];
      for (const track of ev.tracks) {
        tracks.push(new RTCMediaStreamTrack(track));
      }
      return new RTCUserMedia(tracks, ev.streamId);
    })
    .catch(({ message, code }) => {
      let error;
      switch (code) {
        case 'TypeError':
          error = new TypeError(message);
          break;
      }
      if (!error) {
        error = new RTCMediaStreamError({ message, name: code });
      }
      throw error;
    });
}

export function stopDisplayMedia(): void {
  logger.log("# stop display media");
  RTCUserMedia.nativeStopDisplayMedia();
}
