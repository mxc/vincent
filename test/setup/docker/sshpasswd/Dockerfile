#sudo docker build -t vincentsshpasswd .
FROM ubuntu
RUN sudo apt-get update && apt-get upgrade -y
RUN sudo apt-get install ansible -y
RUN sudo apt-get install openssh-server -y
RUN mkdir /var/run/sshd
RUN sudo  useradd -m -G sudo vincent
RUN echo 'vincent:pass' | chpasswd

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

EXPOSE 22
CMD ["/usr/sbin/sshd", "-d", "-E", "/var/log/ssh.log", "-D"]
