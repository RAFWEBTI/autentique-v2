"use strict";
import { Readable } from "stream";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import Api from "../common/Api";
import utils from "../common/utils";

async function createReadStreamFromBuffer(buffer, filename) {
  let done = false;

  const stream = new Readable({
    read() {
      if (!done) {
        this.push(buffer);
        done = true;
      } else {
        this.push(null);
      }
    },
  });

  stream.path = filename;
  stream.filename = filename;

  return stream;
}

const create = async (
  { token, sandbox = false },
  { document, signers, filename: originalFilename, file, fileUrl },
) => {
  try {
    const variables = {
      sandbox,
      document: {
        ...document,
        name: document.name.substring(0, 199),
      },
      signers,
      file: null,
    };

    const filename = `${__dirname}/../resources/documents/create.graphql`;
    const operations = fs
      .readFileSync(filename)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$variables", JSON.stringify(variables));

    let buffer = file;
    if (fileUrl) {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      buffer = Buffer.from(response.data);
    }

    const formData = new FormData();
    formData.append("operations", utils.query(operations));
    formData.append("map", JSON.stringify({ file: ["variables.file"] }));

    const bufferToStream = await createReadStreamFromBuffer(
      buffer,
      originalFilename,
    );

    formData.append("file", bufferToStream, {
      filename: originalFilename,
      contentType: "application/octet-stream",
      knownLength: buffer.length,
    });

    const response = await Api(token).post("/graphql", formData, {
      processData: false,
      withCredentials: true,
      cache: false,
      timeout: 180000,
      headers: formData.getHeaders(),
    });

    return response && response.data;
  } catch (error) {
    console.error(error);
  }
};

export { create };
