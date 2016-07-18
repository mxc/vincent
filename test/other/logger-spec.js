/**
 * Created by mark on 2016/07/17.
 */

import {expect} from 'chai';
import {logger} from '../../src/Logger';
import buffer from 'buffer';

describe("Logger utility ", ()=> {
    "use strict";

    it("should allow streams to be added",()=>{
        let buf = new buffer.Buffer(256,"utf-8");
        logger.addStream(buf,"warn","stream");
        logger.warn("Test");
        expect(logger.getStreams().length).to.equal(2);
        expect(buf.toString("utf-8",0,17)).to.equal("{\"name\":\"vincent\"");
    });

    it("should allow streams to be replaced",()=>{
        let buf = new buffer.Buffer(256,"utf-8");
        logger.setStream(buf,"warn","stream");
        logger.warn("Test");
        expect(logger.getStreams().length).to.equal(1);
        expect(buf.toString("utf-8",0,17)).to.equal("{\"name\":\"vincent\"");
    });

});