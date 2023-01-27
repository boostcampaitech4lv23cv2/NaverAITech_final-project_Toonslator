import { useState, useEffect } from "react";
import { Input, Select, Button, InputNumber, message, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import FontList from "../FontList.json";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const FontSelect = ({ font, setFont, fontSize, setFontSize, onFocus }) => {
  return (
    <div>
      폰트
      <div>
        <Select
          style={{
            width: 180,
          }}
          showSearch
          filterOption={(input, option) =>
            (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
          }
          value={font}
          onSelect={(value) => {
            setFont(value);
          }}
          onFocus={onFocus}
        >
          <Select.OptGroup label="추천 폰트(미구현)">
            <Option value="Noto Sans KR">
              <Text type="success" strong>
                99%
              </Text>{" "}
              Noto Sans KR
            </Option>
          </Select.OptGroup>
          <Select.OptGroup label="기본 폰트">
            {FontList.map(({ name }) => {
              return (
                <Option key={name} value={name}>
                  {name}
                </Option>
              );
            })}
          </Select.OptGroup>
        </Select>
        <Select
          style={{
            width: 100,
          }}
          value={fontSize}
          onSelect={(value) => {
            setFontSize(value);
          }}
          onFocus={onFocus}
        >
          {[32, 36, 40, 44, 48, 52].map((value) => {
            return (
              <Option key={value} value={value}>
                {value}
              </Option>
            );
          })}
        </Select>
      </div>
    </div>
  );
};

const Box = ({ i, rect, delBox, convertBox }) => {
  const [textKor, setTextKor] = useState(rect.textKor);
  const [textEng, setTextEng] = useState(rect.textEng);
  const [font, setFont] = useState(rect.fontFamily);
  const [fontSize, setFontSize] = useState(rect.fontSize);

  const [x, setX] = useState(0);
  const [selected, setSelected] = useState(false);

  rect.setSelected = (f) => {
    setSelected(f);
  };
  rect.refresh = ({ text }) => {
    setX((x) => x + 1);
    setTextEng(text);
  };
  useEffect(() => {
    rect.textKor = textKor;
    rect.text = rect.textEng = textEng;
    rect.fontFamily = font;
    rect.fontSize = fontSize;
    rect.canvas?.renderAll();
  }, [textKor, textEng, font, fontSize]);

  useEffect(() => {
    console.log("Box Created", i, rect.id);
    if (textKor !== "") onTranslate();
  }, []);

  const [tLoading, setTLoading] = useState(false);
  const onTranslate = () => {
    setTLoading(true);
    select();
    fetch(
      "http://49.50.160.104:30002/mt/?" +
        new URLSearchParams({
          text: textKor,
        }),
      {
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setTextEng(res);
        setTLoading(false);
      })
      .catch((err) => {
        console.error(err);
        message.error("번역에 실패했습니다.");
        setTLoading(false);
      });
  };

  const select = () => {
    rect.canvas?.setActiveObject(rect);
    rect.canvas?.renderAll();
  };

  return (
    <div
      style={{
        margin: 10,
        padding: 5,
        border: selected ? "1px solid black" : "1px solid #d9d9d9",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        대사 #{i}
        <div
          style={{
            // position: 'relative',
            top: 0,
            right: 0,
            margin: "0 0 0 10",
          }}
        >
          <Button>인식(미구현)</Button>
          <Button onClick={onTranslate} loading={tLoading}>
            번역
          </Button>
          {rect.get("type") === "rect" && (
            <Button onClick={convertBox}>변환</Button>
          )}
          <Button onClick={delBox} danger>
            삭제
          </Button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: 5,
            width: "100%",
          }}
        >
          한국어 대사
          <TextArea
            onChange={(event) => {
              setTextKor(event.target.value);
            }}
            value={textKor}
            autoSize
            onFocus={select}
          />
        </div>
        <div
          style={{
            marginTop: 21,
            display: "flex",
            alignItems: "center",
          }}
        >
          <RightOutlined />
        </div>
        <div
          style={{
            padding: 5,
            width: "100%",
          }}
        >
          영어 대사
          <TextArea
            onChange={(event) => {
              setTextEng(event.target.value);
            }}
            value={textEng}
            autoSize
            onFocus={select}
          />
        </div>
      </div>
      <FontSelect
        font={font}
        setFont={setFont}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onFocus={select}
      />
    </div>
  );
};

export default Box;
